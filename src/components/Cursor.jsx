import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./Cursor.css";

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useGSAP(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const dotX = gsap.quickTo(dot.current, "x", { duration: 0.15, ease: "power3" });
    const dotY = gsap.quickTo(dot.current, "y", { duration: 0.15, ease: "power3" });
    const ringX = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3" });
    const ringY = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3" });

    const move = (e) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const over = (e) => {
      const target = e.target.closest("a, button, [data-cursor]");
      gsap.to(ring.current, {
        scale: target ? 2.4 : 1,
        opacity: target ? 0.9 : 0.5,
        duration: 0.4,
        ease: "power3.out",
      });
      ring.current.dataset.label =
        target?.dataset.cursor === "view" ? "voir" : "";
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  });

  return (
    <div className="cursor" aria-hidden="true">
      <span className="cursor__dot" ref={dot} />
      <span className="cursor__ring" ref={ring} />
    </div>
  );
}
