import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./Marquee.css";

const PHRASES = ["Produits de saison", "Ardoise du jour", "Cocktails maison", "Terrasse au soleil"];

export default function Marquee() {
  const root = useRef(null);

  useGSAP(
    () => {
      const tween = gsap.to(".marquee__track", {
        xPercent: -50,
        duration: 28,
        ease: "none",
        repeat: -1,
      });

      /* Le sens du défilement suit le sens du scroll */
      let lastY = window.scrollY;
      const onScroll = () => {
        const direction = window.scrollY > lastY ? 1 : -1;
        lastY = window.scrollY;
        gsap.to(tween, { timeScale: direction, duration: 0.6, overwrite: true });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    },
    { scope: root }
  );

  const sequence = [...PHRASES, ...PHRASES];

  return (
    <div className="marquee" ref={root} aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((half) => (
          <div className="marquee__half" key={half}>
            {sequence.map((phrase, i) => (
              <span className="marquee__item" key={i}>
                {phrase} <i className="marquee__diamond" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
