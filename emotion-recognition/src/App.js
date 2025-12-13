import React, { useRef, useEffect } from "react";
import "./App.css";
import Webcam from "react-webcam";
import { drawYOLOPredictions } from "./utils/draw";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const emotionLabels = ["angry","disgust","fear","happy","sad","surprise","neutral"];

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000");

    socket.onopen = () => {
      console.log("WebSocket connected");

      const timer = setInterval(() => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
          const src = webcamRef.current.getScreenshot();
          if (src) socket.send(JSON.stringify({ data:{image:src} }));
        }
      }, 450);

      socket.onclose = () => clearInterval(timer);
    };

    socket.onmessage = (event) => {
      const { predictions } = JSON.parse(event.data);

      emotionLabels.forEach(label => {
        const el = document.getElementById(label);
        if(el) el.value = 0;
      });

      let dominant = "Neutral";

      if(predictions.length > 0){
        predictions.forEach(pred => {
          const idx = pred.emotion_index;
          const scr = Math.round(pred.score * 100);
          const el = document.getElementById(emotionLabels[idx]);
          if(el) el.value = scr;
        });

        const top = predictions.reduce((a,b)=>a.score>b.score?a:b);
        dominant = top.emotion_label;
      }

      const emotionEl = document.getElementById("emotion_text");
      if(emotionEl) emotionEl.value = dominant;

      const video = webcamRef.current.video;
      const ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;

      drawYOLOPredictions(predictions, ctx);
    };
  }, []);

  return (
    <div className="App">
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{
          position: "absolute",
          left: 0,
          top: 20,
          width: 640,
          height: 480,
          zIndex: 9
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          top: 20,
          width: 640,
          height: 480,
          zIndex: 10
        }}
      />

      <div style={{position:"absolute",right:50,top:50}}>
        {emotionLabels.map(label => (
          <div key={label}>
            <label>{label}</label>
            <progress id={label} value="0" max="100"></progress>
          </div>
        ))}
      </div>

      {/* <input
        id="emotion_text"
        defaultValue="Neutral"
        style={{
          position:"absolute",
          bottom:60,
          left:300,
          width:200,
          height:50,
          fontSize:"28px"
        }}
      /> */}
    </div>
  );
}

export default App;


