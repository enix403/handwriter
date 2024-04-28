import { Pill } from "@mantine/core";
import { useEffect, useRef } from "react";
import useSize from "@react-hook/size";

import { Application } from "./Application";

export function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [width, height] = useSize(containerRef);

  const app = useRef<Application | null>();

  useEffect(() => {
    app.current = new Application(canvasRef.current!, width, height);
  }, []);

  useEffect(() => {
    if (app.current) {
      app.current.onResize(width, height);
    }
  }, [width, height]);

  return (
    <>
      <main className='flex h-full max-h-full bg-[#0B1416] text-white'>
        <div className='w-64 border-r border-slate-400 p-4 shrink-0'>
          Size:{" "}
          <Pill size='lg'>
            {width} x {height}
          </Pill>
        </div>
        <div ref={containerRef} className='flex-1'>
          <div ref={canvasRef} className="h-full" />
        </div>
      </main>
    </>
  );
}
