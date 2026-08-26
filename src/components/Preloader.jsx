import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import "./Preloader.css";

gsap.registerPlugin(DrawSVGPlugin);

export default function Preloader({ onComplete }) {
  const root = useRef(null);

  useGSAP(
    () => {
      const counter = { value: 0 };
      const counterEl = root.current.querySelector(".preloader__counter");

      const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });

      tl.from(".preloader__mark path", {
        drawSVG: "0%",
        duration: 1.6,
        stagger: 0.12,
        ease: "power2.inOut",
      })
        .to(
          counter,
          {
            value: 100,
            duration: 2,
            ease: "power2.inOut",
            onUpdate: () => {
              counterEl.textContent = String(Math.round(counter.value)).padStart(3, "0");
            },
          },
          0
        )
        .from(
          ".preloader__word span",
          { yPercent: 120, duration: 0.9, stagger: 0.05, ease: "power4.out" },
          0.4
        )
        .to(".preloader__inner", { opacity: 0, y: -40, duration: 0.6 }, "+=0.2")
        .add(() => onComplete(), "-=0.1")
        .to(".preloader__panel", {
          yPercent: -100,
          duration: 1.1,
          stagger: 0.08,
          ease: "power4.inOut",
        })
        .set(root.current, { display: "none" });
    },
    { scope: root }
  );

  return (
    <div className="preloader" ref={root}>
      <div className="preloader__panels">
        <span className="preloader__panel" />
        <span className="preloader__panel" />
        <span className="preloader__panel" />
      </div>

      <div className="preloader__inner">
        <svg
          className="preloader__mark"
          viewBox="0 0 120 80"
          fill="none"
          aria-hidden="true"
        >
          <path d="M30 34 A30 30 0 0 1 90 34" />
          <path d="M22 44 Q37 36 52 44 T82 44 T98 44" />
          <path d="M28 54 Q41 47 54 54 T80 54 T94 54" />
          <path d="M36 64 Q47 58 58 64 T80 64" />
        </svg>

        <p className="preloader__word" aria-label="Dam'Oui">
          {"DAM'OUI".split("").map((char, i) => (
            <span key={i}>{char}</span>
          ))}
        </p>

        <p className="preloader__place label">Saint-Pierre-Quiberon</p>
      </div>

      <span className="preloader__counter">000</span>
    </div>
  );
}
