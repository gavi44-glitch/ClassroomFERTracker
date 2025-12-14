export function drawYOLOPredictions(predictions, ctx) {
  if (!ctx || !predictions) return;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const colorMap = {
    angry: "#ef4444",
    disgust: "#22c55e",
    fear: "#a855f7",
    happy: "#f59e0b",
    sad: "#3b82f6",
    surprise: "#eab308",
    neutral: "#6b7280",
  };

  predictions.forEach((pred, index) => {
    const [x1, y1, x2, y2] = pred.box;
    const emotion = pred.emotion_label;
    const color = colorMap[emotion] || "#ffffff";
    const score = Math.round(pred.score * 100);

    // Draw bounding box with rounded corners effect
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

    // Draw corner accents
    const cornerSize = 15;
    ctx.lineWidth = 4;
    ctx.beginPath();
    // Top-left
    ctx.moveTo(x1, y1 + cornerSize);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 + cornerSize, y1);
    // Top-right
    ctx.moveTo(x2 - cornerSize, y1);
    ctx.lineTo(x2, y1);
    ctx.lineTo(x2, y1 + cornerSize);
    // Bottom-right
    ctx.moveTo(x2, y2 - cornerSize);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2 - cornerSize, y2);
    // Bottom-left
    ctx.moveTo(x1 + cornerSize, y2);
    ctx.lineTo(x1, y2);
    ctx.lineTo(x1, y2 - cornerSize);
    ctx.stroke();

    // Draw label background
    const label = `#${index + 1} ${emotion} ${score}%`;
    ctx.font = "bold 14px Inter, sans-serif";
    const textWidth = ctx.measureText(label).width;
    const padding = 8;
    const labelHeight = 24;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(
      x1,
      y1 - labelHeight - 4,
      textWidth + padding * 2,
      labelHeight,
      4
    );
    ctx.fill();

    // Draw label text
    ctx.fillStyle = "#000000";
    ctx.fillText(label, x1 + padding, y1 - 10);
  });
}
