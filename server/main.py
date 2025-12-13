import os
import json
import base64
import cv2
import numpy as np
import torch
from fastapi import FastAPI, WebSocket
from ultralytics import YOLO
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
import traceback
import time

emotion_labels = ["angry","disgust","fear","happy","sad","surprise","neutral"]

YOLO_PATH = "C:/Users/Gavi/Desktop/facial-emotion-recognition/Resources/models/best.pt"
RESNET_PATH = "C:/Users/Gavi/Desktop/facial-emotion-recognition/Resources/models/best_model.pth"

print("Loading YOLOv8n model...")
yolo_model = YOLO(YOLO_PATH)

print("Loading ResNet-50 model...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
resnet_model = models.resnet50(weights=None)
resnet_model.fc = nn.Linear(resnet_model.fc.in_features, 7)
resnet_model.to(device)

checkpoint = torch.load(RESNET_PATH, map_location=device)
if "model_state_dict" in checkpoint:
    resnet_model.load_state_dict(checkpoint["model_state_dict"])
else:
    resnet_model.load_state_dict(checkpoint)
resnet_model.eval()

val_transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
])

app = FastAPI()

def detect_faces(frame, conf=0.25):
    results = yolo_model(frame, conf=conf)
    return results[0].boxes.xyxy.cpu().numpy()

def classify_emotion(crop):
    crop = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
    tensor = val_transform(crop).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = resnet_model(tensor)
        probs = torch.softmax(logits, dim=1)
        idx = torch.argmax(probs).item()

    return idx, float(probs[0][idx])


last_detection = 0
last_boxes = []
last_results = []


@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected")

    global last_detection, last_boxes, last_results

    try:
        while True:
            payload = await websocket.receive_text()
            payload = json.loads(payload)
            image_b64 = payload["data"]["image"].split(",")[1]

            image = np.frombuffer(base64.b64decode(image_b64), np.uint8)
            image = cv2.imdecode(image, cv2.IMREAD_COLOR)

            now = time.time()

            run_detection = False
            if now - last_detection > 0.25:
                run_detection = True
                last_detection = now

            if run_detection:
                boxes = detect_faces(image, conf=0.2)
                last_boxes = boxes
            else:
                boxes = last_boxes  

            results = []

            if run_detection:
                temp_results = []

                for (x1, y1, x2, y2) in boxes:
                    x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])
                    crop = image[y1:y2, x1:x2]

                    if crop.size == 0:
                        continue

                    idx, score = classify_emotion(crop)

                    temp_results.append({
                        "box": [x1, y1, x2, y2],
                        "emotion_index": idx,
                        "emotion_label": emotion_labels[idx],
                        "score": score
                    })

                last_results = temp_results
                results = temp_results

            else:
                # Use cached emotion results
                results = last_results

            await websocket.send_json({"predictions": results})

    except Exception:
        traceback.print_exc()
        await websocket.close()
