export type ShapeType =
  | "rectangle"
  | "circle"
  | "diamond"
  | "arrow"
  | "hand"
  | "line";

export interface Shape {
  type: ShapeType;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface ViewTransform {
  x: number;
  y: number;
  scale: number;
}

//store all completed shapes
const shapes: Shape[] = [];
let currentTool: ShapeType = "rectangle";
const viewTransform: ViewTransform = { x: 0, y: 0, scale: 1 };

export function setCurrentTool(tool: ShapeType) {
  currentTool = tool;
}

export function getCurrentTool(): ShapeType {
  return currentTool;
}

//convert screen coordinates to world coordinated
function screenToWorld(
  screenX: number,
  screenY: number
): { x: number; y: number } {
  return {
    x: (screenX - viewTransform.x) / viewTransform.scale,
    y: (screenY - viewTransform.y) / viewTransform.scale,
  };
}

//convert world coordinates to screen coordinates
// function worldToScreen(
//   worldX: number,
//   worldY: number
// ): { x: number; y: number } {
//   return {
//     x: worldX * viewTransform.scale + viewTransform.x,
//     y: worldY * viewTransform.scale + viewTransform.y,
//   };
// }

//get mouse position relative to canvas
function getMousePos(
  canvas: HTMLCanvasElement,
  e: MouseEvent
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

//draw grid background
function drawGrid(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const gridSize = 20;
  const scaledGridSize = gridSize * viewTransform.scale;

  if (scaledGridSize > 5) return;

  ctx.strokeStyle = "rgba(64, 64, 64, 0.3)";
  ctx.lineWidth = 1;

  const startX = -(viewTransform.x % scaledGridSize);
  const startY = -(viewTransform.y % scaledGridSize);

  //horizontal lines
  for (let x = startX; x < canvas.width; x += scaledGridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  //vertical lines
  for (let y = startY; y < canvas.height; y += scaledGridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

//draw initial background
function drawBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) {
  ctx.fillStyle = "rgba(18, 18, 18, 1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid(ctx, canvas);
}

function drawSingleShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  const { type, startX, startY, endX, endY } = shape;

  // Set common stroke properties
  ctx.lineWidth = 2 / viewTransform.scale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(240, 240, 240, 1)";

  switch (type) {
    case "rectangle":
      drawRectangle(ctx, startX, startY, endX, endY);
      break;
    case "circle":
      drawCircle(ctx, startX, startY, endX, endY);
      break;
    case "diamond":
      drawDiamond(ctx, startX, startY, endX, endY);
      break;
    case "line":
      drawLine(ctx, startX, startY, endX, endY);
      break;
  }
}

//for rounded rectangle
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

//for rounded diamond
function drawRoundedCorner(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  cornerX: number,
  cornerY: number,
  toX: number,
  toY: number,
  radius: number
) {
  // Calculate the distance from corner to the points
  const d1 = Math.sqrt((fromX - cornerX) ** 2 + (fromY - cornerY) ** 2);
  const d2 = Math.sqrt((toX - cornerX) ** 2 + (toY - cornerY) ** 2);

  // Calculate the actual radius to use (can't be larger than half the distance to either point)
  const maxRadius = Math.min(d1, d2) * 0.5;
  const actualRadius = Math.min(radius, maxRadius);

  // Calculate the control point offsets
  const t1 = actualRadius / d1;
  const t2 = actualRadius / d2;

  // Calculate the start and end points of the curve
  const startX = cornerX + t1 * (fromX - cornerX);
  const startY = cornerY + t1 * (fromY - cornerY);
  const endX = cornerX + t2 * (toX - cornerX);
  const endY = cornerY + t2 * (toY - cornerY);

  // Draw line to the start of the curve
  ctx.lineTo(startX, startY);
  // Draw the quadratic curve
  ctx.quadraticCurveTo(cornerX, cornerY, endX, endY);
}

//drawing rectangle
function drawRectangle(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  const rawWidth = endX - startX;
  const rawHeight = endY - startY;

  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);

  const width = Math.abs(rawWidth);
  const height = Math.abs(rawHeight);

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(240, 240, 240, 1)";

  const cornerRadius = 40 / viewTransform.scale;
  drawRoundedRect(ctx, x, y, width, height, cornerRadius);
  ctx.stroke();
}

//drawing circle
function drawCircle(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  const centerX = (startX + endX) / 2;
  const centerY = (startY + endY) / 2;
  const radiusX = Math.abs(endX - startX) / 2;
  const radiusY = Math.abs(endY - startY) / 2;

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.stroke();
}

//drawing diamond
function drawDiamond(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  const centerX = (startX + endX) / 2;
  const centerY = (startY + endY) / 2;
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  // Calculate the four diamond points
  const topX = centerX;
  const topY = Math.min(startY, endY);
  const rightX = Math.max(startX, endX);
  const rightY = centerY;
  const bottomX = centerX;
  const bottomY = Math.max(startY, endY);
  const leftX = Math.min(startX, endX);
  const leftY = centerY;

  // Define corner radius - adjust this value to make corners more or less rounded
  const cornerRadius = (Math.min(width, height) * 0.15) / viewTransform.scale;

  ctx.beginPath();
  drawRoundedCorner(
    ctx,
    topX,
    topY,
    rightX,
    rightY,
    bottomX,
    bottomY,
    cornerRadius
  ); // Top to Right to Bottom
  drawRoundedCorner(
    ctx,
    rightX,
    rightY,
    bottomX,
    bottomY,
    leftX,
    leftY,
    cornerRadius
  ); // Right to Bottom to Left
  drawRoundedCorner(
    ctx,
    bottomX,
    bottomY,
    leftX,
    leftY,
    topX,
    topY,
    cornerRadius
  ); // Bottom to Left to Top
  drawRoundedCorner(
    ctx,
    leftX,
    leftY,
    topX,
    topY,
    rightX,
    rightY,
    cornerRadius
  );
  ctx.closePath();
  ctx.stroke();
}

//draw line
function drawLine(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}

function redrawCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) {
  // Clear and draw background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  drawBackground(ctx, canvas);

  ctx.translate(viewTransform.x, viewTransform.y);
  ctx.scale(viewTransform.scale, viewTransform.scale);

  // Draw all completed rectangles
  shapes.forEach((shape) => {
    drawSingleShape(ctx, shape);
  });

  ctx.restore();
}

export function initDraw(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  redrawCanvas(ctx, canvas);

  let isDrawing = false;
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let lastPanX = 0;
  let lastPanY = 0;

  //mousedown handler
  canvas.addEventListener("mousedown", (e) => {
    const mousePos = getMousePos(canvas, e);

    if (currentTool === "hand") {
      isPanning = true;
      lastPanX = mousePos.x;
      lastPanY = mousePos.y;
      canvas.style.cursor = "grabbing";
    } else {
      isDrawing = true;
      const worldPos = screenToWorld(mousePos.x, mousePos.y);
      startX = worldPos.x;
      startY = worldPos.y;
    }
  });

  //mouseup handler
  canvas.addEventListener("mouseup", (e) => {
    if (isPanning) {
      isPanning = false;
      canvas.style.cursor = currentTool === "hand" ? "grab" : "crosshair";
    } else if (isDrawing) {
      isDrawing = false;

      const mousePos = getMousePos(canvas, e);
      const worldPos = screenToWorld(mousePos.x, mousePos.y);

      if (startX !== worldPos.x || startY !== worldPos.y) {
        shapes.push({
          type: currentTool,
          startX,
          startY,
          endX: worldPos.x,
          endY: worldPos.y,
        });
      }

      //final redraw
      redrawCanvas(ctx, canvas);
    }
  });

  //mousemove handler
  canvas.addEventListener("mousemove", (e) => {
    const mousePos = getMousePos(canvas, e);

    if (isPanning) {
      const deltaX = mousePos.x - lastPanX;
      const deltaY = mousePos.y - lastPanY;

      viewTransform.x += deltaX;
      viewTransform.y += deltaY;

      lastPanX = mousePos.x;
      lastPanY = mousePos.y;

      redrawCanvas(ctx, canvas);
    } else if (isDrawing) {
      const worldPos = screenToWorld(mousePos.x, mousePos.y);

      redrawCanvas(ctx, canvas);

      ctx.save();
      ctx.translate(viewTransform.x, viewTransform.y);
      ctx.scale(viewTransform.scale, viewTransform.scale);

      drawSingleShape(ctx, {
        type: currentTool,
        startX,
        startY,
        endX: worldPos.x,
        endY: worldPos.y,
      });

      ctx.restore();
    }
  });

  //wheel handler
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      const mousePos = getMousePos(canvas, e);
      const worldPosBeforeZoom = screenToWorld(mousePos.x, mousePos.y);

      //zoom factor
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(
        0.1,
        Math.min(5, viewTransform.scale * zoomFactor)
      );

      viewTransform.scale = newScale;

      //adjust pan to keep mouse position stable
      const worldPosAfterZoom = screenToWorld(mousePos.x, mousePos.y);
      viewTransform.x +=
        (worldPosAfterZoom.x - worldPosBeforeZoom.x) * viewTransform.scale;
      viewTransform.y +=
        (worldPosAfterZoom.y - worldPosBeforeZoom.y) * viewTransform.scale;

      redrawCanvas(ctx, canvas);
    }
  });

  //update cursor based on tool
  const updateCursor = () => {
    if (currentTool === "hand") {
      canvas.style.cursor = isPanning ? "grabbing" : "grab";
    } else if (currentTool === "arrow") {
      canvas.style.cursor = "default";
    } else {
      canvas.style.cursor = "crosshair";
    }
  };

  //initial cursor setup
  updateCursor();

  //export function to update cursor
  (window as any).updateCanvasCursor = updateCursor;
}
