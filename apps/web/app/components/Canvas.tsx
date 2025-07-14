"use client";

import { useEffect, useRef } from "react";
import { initDraw } from "../draw";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;

      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      resizeCanvas();

      window.addEventListener("resize", resizeCanvas);

      initDraw(canvas);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} className="block"></canvas>
    </div>
  );
}
