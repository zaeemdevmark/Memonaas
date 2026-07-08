"use client";

import { useEffect } from "react";

export default function ClickEffect() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = document.createElement("div");
      el.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(17, 17, 17, 0.25);
        pointer-events: none;
        z-index: 99999;
        animation: click-ripple 0.45s ease-out forwards;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 450);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
