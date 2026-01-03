import os
import asyncio

import json
import base64
import cv2
import numpy as np
import torch
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
import traceback
import time

emotion_labels = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"]


YOLO_PATH = "../Resources/models/best.pt"
RESNET_PATH = "../Resources/models/best_model.pth"

print("Loading YOLOv8n model...")
yolo_model = YOLO(YOLO_PATH)

print("Loading ResNet-50 model...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

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
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def detect_faces(frame, conf=0.1):
    results = yolo_model(frame, conf=conf, verbose=False)
    boxes = results[0].boxes
    if boxes is not None and len(boxes) > 0:
        return boxes.xyxy.cpu().numpy()
    return []


def classify_emotion(crop):
    try:
        crop_rgb = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
        tensor = val_transform(crop_rgb).unsqueeze(0).to(device)

        with torch.no_grad():
            logits = resnet_model(tensor)
            probs = torch.softmax(logits, dim=1)
            idx = torch.argmax(probs).item()

        return idx, float(probs[0][idx])
    except Exception as e:
        print(f"Emotion classification error: {e}")
        return 6, 0.5  

def run_inference(image, conf):
    boxes = detect_faces(image, conf=conf)

    results = []
    for box in boxes:
        x1, y1, x2, y2 = map(int, box[:4])

        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(image.shape[1], x2)
        y2 = min(image.shape[0], y2)

        crop = image[y1:y2, x1:x2]

        if crop.size == 0 or crop.shape[0] < 10 or crop.shape[1] < 10:
            continue

        idx, score = classify_emotion(crop)

        if score < 0.55:
            continue 

        results.append({
            "box": [x1, y1, x2, y2],
            "emotion_index": idx,
            "emotion_label": emotion_labels[idx],
            "score": score
        })

    return results


# Per-connection state (not global)
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected")

    last_detection = 0
    last_boxes = []
    last_results = []

    try:
        while True:
            payload = await websocket.receive_text()
            data = json.loads(payload)

            # if data.get("type") == "ping":
            #     await websocket.send_json({"type": "pong"})
            #     continue
            camera_enabled = data.get("cameraEnabled", True)

            if not camera_enabled:
                last_results = []
                await websocket.send_json({"predictions": []})
                continue

            image_data = data.get("data", {}).get("image", "")
            if not image_data:
                continue

            if "," in image_data:
                image_b64 = image_data.split(",")[1]
            else:
                image_b64 = image_data

            image_bytes = base64.b64decode(image_b64)
            image_array = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

            if image is None:
                last_results = []   
                await websocket.send_json({"predictions": []})
                continue


            now = time.time()

            run_detection = (now - last_detection) > 0.25

            if run_detection:
                last_detection = now

                results = await asyncio.to_thread(
                    run_inference,
                    image,
                    0.45
                )

                last_results = results
            else:
                results = last_results

            await websocket.send_json({"predictions": results})

    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        traceback.print_exc()
        try:
            await websocket.close()
        except:
            pass


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "device": str(device)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)