type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    };

export function initDraw(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  ctx.fillStyle = "rgba(18, 18, 18, 1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    console.log(e.clientX, e.clientY);
  });

  function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    // Clamp radius to prevent weird shapes when width/height is small
    const maxRadius = Math.min(Math.abs(width) / 2, Math.abs(height) / 2);
    const clampedRadius = Math.min(radius, maxRadius);

    // Handle edge cases where dimensions are too small
    if (Math.abs(width) < 2 || Math.abs(height) < 2) {
      // Just draw a regular rectangle for very small dimensions
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.closePath();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x + clampedRadius, y);
    ctx.lineTo(x + width - clampedRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
    ctx.lineTo(x + width, y + height - clampedRadius);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - clampedRadius,
      y + height
    );
    ctx.lineTo(x + clampedRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
    ctx.lineTo(x, y + clampedRadius);
    ctx.quadraticCurveTo(x, y, x + clampedRadius, y);
    ctx.closePath();
  }

  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      const rawWidth = e.clientX - startX;
      const rawHeight = e.clientY - startY;

      const x = Math.min(startX, e.clientX);
      const y = Math.min(startY, e.clientY);

      const width = Math.abs(rawWidth);
      const height = Math.abs(rawHeight);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(18, 18, 18, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.strokeStyle = "rgba(240, 240, 240, 1)";
      const cornerRadius = 40;
      drawRoundedRect(ctx, x, y, width, height, cornerRadius);
      ctx.stroke();
    }
  });
}
