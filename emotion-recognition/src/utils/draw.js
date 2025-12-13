export function drawYOLOPredictions(predictions, ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  predictions.forEach(pred => {
    const [x1, y1, x2, y2] = pred.box;

    const emotion = pred.emotion_label;
    const colorMap = {
      angry: "red",
      disgust: "green",
      fear: "purple",
      happy: "orange",
      sad: "blue",
      surprise: "yellow",
      neutral: "white"
    };

    const color = colorMap[emotion] || "white";

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

    ctx.fillStyle = color;
    ctx.font = "20px Arial";
    ctx.fillText(
      `${emotion} (${Math.round(pred.score * 100)}%)`,
      x1,
      y1 - 10
    );
  });
}
