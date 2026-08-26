import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./Hero.css";

export default function Hero({ ready }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (!ready) return;

      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .from(".hero__image img", { scale: 1.35, duration: 2.2, ease: "power3.out" }, 0)
        .fromTo(
          ".hero__logo",
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 1.6, ease: "power4.inOut" },
          0.2
        )
        .from(".hero__logo img", { scale: 1.18, yPercent: 10, duration: 1.8 }, 0.2)
        .from(".hero__script", { opacity: 0, y: 30, duration: 1.2 }, 0.9)
        .from(".hero__meta > *", { opacity: 0, y: 20, duration: 1, stagger: 0.1 }, 1.1)
        .from(".hero__scroll", { opacity: 0, duration: 1 }, 1.4);

      /* Parallaxe de sortie */
      gsap.to(".hero__image", {
        yPercent: 22,
        scale: 1.08,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero__content", {
        yPercent: -30,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "70% top", scrub: true },
      });
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero__image">
        <img src="/images/salle-arches.png" alt="La salle du Dam'Oui et ses arches en pierre" />
      </div>

      <div className="hero__content">
        <p className="hero__script">l'ardoise de la presqu'île</p>
        <h1 className="hero__logo">
          <img src="/images/logo-light.png" alt="Dam'Oui — Restaurant, Since 2022" />
        </h1>
        <div className="hero__meta">
          <p>Restaurant</p>
          <span className="hero__meta-line" />
          <p>Saint-Pierre-Quiberon</p>
          <span className="hero__meta-line" />
          <p>Since 2022</p>
        </div>
      </div>

      <div className="hero__scroll">
        <span />
        <p className="label">Découvrir</p>
      </div>
    </section>
  );
}
