"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

interface ScratchRevealProps {
  children: React.ReactNode;
  hint: string;
  className?: string;
}

const BRUSH = 26;
const REVEAL_THRESHOLD = 0.42;

/**
 * Canvas "scratch card". Pointer strokes erase a gold foil overlay to reveal
 * the date underneath; passing the threshold (or reduced-motion) auto-clears.
 */
export function ScratchReveal({ children, hint, className }: ScratchRevealProps) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [scratching, setScratching] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const paintFoil = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#c9a35b");
    gradient.addColorStop(0.5, "#d98e8e");
    gradient.addColorStop(1, "#a8505a");
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = BRUSH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    if (reduce) {
      setRevealed(true);
      return;
    }
    if (revealed) return;
    paintFoil();
    const onResize = () => {
      if (!drawingRef.current) paintFoil();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [reduce, revealed, paintFoil]);

  const checkProgress = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { width, height } = canvas;
    if (!width || !height) return;
    const data = ctx.getImageData(0, 0, width, height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 24) {
      total += 1;
      if (data[i] < 32) clear += 1;
    }
    if (total > 0 && clear / total > REVEAL_THRESHOLD) setRevealed(true);
  }, []);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (reduce || revealed) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    setScratching(true);
    const point = pointFromEvent(event);
    lastRef.current = point;
    stroke({ x: point.x - 0.01, y: point.y }, point);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const point = pointFromEvent(event);
    if (lastRef.current) stroke(lastRef.current, point);
    lastRef.current = point;
  };

  const onPointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastRef.current = null;
    checkProgress();
  };

  return (
    <div ref={wrapRef} className={cn("relative overflow-hidden", className)}>
      {children}

      <motion.canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        animate={{ opacity: revealed ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        style={{ pointerEvents: revealed ? "none" : "auto" }}
        className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
      />

      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs tracking-wide text-cream/90 transition-opacity duration-300",
          scratching && "opacity-0",
        )}
      >
        {hint}
      </span>

      <button
        type="button"
        onClick={() => setRevealed(true)}
        className="sr-only"
      >
        {hint}
      </button>
    </div>
  );
}
