"use client";

import { useEffect, useRef, useState } from "react";
import { initDraw, setCurrentTool, ShapeType } from "../draw";
import { FaArrowPointer, FaHand } from "react-icons/fa6";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<ShapeType>("arrow");

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

  const handleToolChange = (tool: ShapeType) => {
    setSelectedTool(tool);
    setCurrentTool(tool);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 bg-indigo-900 backdrop-blur-sm rounded-xl shadow-lg px-2 py-2">
          <button
            onClick={() => handleToolChange("hand")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center cursor-pointer h-10 ${
              selectedTool === "hand"
                ? "bg-indigo-400 text-indigo-200"
                : "bg-transparent text-indigo-200/20 hover:bg-indigo-800 hover:text-indigo-200"
            }`}
          >
            <FaHand />
          </button>
          <button
            onClick={() => handleToolChange("arrow")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center cursor-pointer h-10 ${
              selectedTool === "arrow"
                ? "bg-indigo-400 text-indigo-200"
                : "bg-transparent text-indigo-200/20 hover:bg-indigo-800 hover:text-indigo-200"
            }`}
          >
            <FaArrowPointer />
          </button>
          <button
            onClick={() => handleToolChange("rectangle")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center cursor-pointer h-10 ${
              selectedTool === "rectangle"
                ? "bg-indigo-400 text-indigo-200"
                : "bg-transparent text-indigo-200/20 hover:bg-indigo-800 hover:text-indigo-200"
            }`}
          >
            Rectangle
          </button>
          <button
            onClick={() => handleToolChange("circle")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center cursor-pointer h-10 ${
              selectedTool === "circle"
                ? "bg-indigo-400 text-indigo-200"
                : "bg-transparent text-indigo-200/20 hover:bg-indigo-800 hover:text-indigo-200"
            }`}
          >
            Circle
          </button>
          <button
            onClick={() => handleToolChange("diamond")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center cursor-pointer h-10 ${
              selectedTool === "diamond"
                ? "bg-indigo-400 text-indigo-200"
                : "bg-transparent text-indigo-200/20 hover:bg-indigo-800 hover:text-indigo-200"
            }`}
          >
            Diamond
          </button>
          <button
            onClick={() => handleToolChange("line")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center cursor-pointer h-10 ${
              selectedTool === "line"
                ? "bg-indigo-400 text-indigo-200"
                : "bg-transparent text-indigo-200/20 hover:bg-indigo-800 hover:text-indigo-200"
            }`}
          >
            Line
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="block"></canvas>
    </div>
  );
}
