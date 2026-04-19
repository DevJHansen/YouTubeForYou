"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  before: React.ReactNode;
  after: React.ReactNode;
};

export function Comparator({ before, after }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [split, setSplit] = useState(50);
  const draggingRef = useRef(false);

  useEffect(() => {
    const setFromEvent = (e: MouseEvent | TouchEvent) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const clientX =
        "touches" in e
          ? e.touches[0]?.clientX ?? 0
          : (e as MouseEvent).clientX;
      const x = clientX - rect.left;
      const pct = Math.max(4, Math.min(96, (x / rect.width) * 100));
      setSplit(pct);
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (draggingRef.current) setFromEvent(e);
    };
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
    };
  }, []);

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    draggingRef.current = true;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const native = e.nativeEvent as MouseEvent | TouchEvent;
    const clientX =
      "touches" in native
        ? native.touches[0]?.clientX ?? 0
        : (native as MouseEvent).clientX;
    const x = clientX - rect.left;
    const pct = Math.max(4, Math.min(96, (x / rect.width) * 100));
    setSplit(pct);
  };

  return (
    <div
      ref={wrapRef}
      className="ba-wrap"
      style={{ ["--split" as string]: `${split}%` } as React.CSSProperties}
      onMouseDown={onDown}
      onTouchStart={onDown}
    >
      <div className="ba-pane ba-before">{before}</div>
      <div className="ba-pane ba-after">{after}</div>
      <div className="ba-label left">Before</div>
      <div className="ba-label right">ForYou on</div>
      <div className="ba-handle" />
    </div>
  );
}
