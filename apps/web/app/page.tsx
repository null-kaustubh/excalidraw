import Canvas from "./components/Canvas";

export default function Page() {
  return (
    <div className="fixed inset-0 overflow-hidden cursor-crosshair">
      <Canvas />
    </div>
  );
}
