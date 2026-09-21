import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MENU } from "../data.js";
import { getMenu } from "../lib/api.js";
import "./Menu.css";

export default function Menu() {
  const root = useRef(null);
  const preview = useRef(null);
  const [previewSrc, setPreviewSrc] = useState(null);

  /* La carte vit sur l'API (éditable depuis /admin) ;
     les données statiques servent de secours */
  const [menu, setMenu] = useState(MENU);

  useEffect(() => {
    getMenu()
      .then(setMenu)
      .catch(() => {});
  }, []);

  const hidePreview = () => {
    gsap.to(preview.current, { opacity: 0, scale: 0.85, rotate: 3, duration: 0.4, ease: "power3.in" });
  };

  const showPreview = (src) => {
    setPreviewSrc(src);
    gsap.to(preview.current, { opacity: 1, scale: 1, rotate: -3, duration: 0.5, ease: "power3.out" });
  };

  useGSAP(
    () => {
      gsap.from(".menu__row", {
        opacity: 0,
        y: 36,
        duration: 0.9,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: { trigger: ".menu__list", start: "top 78%" },
      });

      gsap.from(".menu__heading .char", {
        yPercent: 110,
        duration: 1,
        stagger: 0.04,
        ease: "power4.out",
        scrollTrigger: { trigger: ".menu__heading", start: "top 82%" },
      });

      /* Avec le smooth scroll, le contenu défile sous la souris sans
         déclencher de mouseleave : on masque l'aperçu dès que la
         section quitte le viewport */
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onLeave: hidePreview,
        onLeaveBack: hidePreview,
      });
    },
    { scope: root, dependencies: [menu], revertOnUpdate: true }
  );

  useGSAP(
    () => {
      if (window.matchMedia("(hover: none)").matches) return;

      const x = gsap.quickTo(preview.current, "x", { duration: 0.6, ease: "power3" });
      const y = gsap.quickTo(preview.current, "y", { duration: 0.6, ease: "power3" });
      const move = (e) => {
        x(e.clientX);
        y(e.clientY);
      };
      window.addEventListener("mousemove", move);
      return () => window.removeEventListener("mousemove", move);
    },
    { scope: root }
  );

  return (
    <section className="menu section" id="ardoise" ref={root} onMouseLeave={hidePreview}>
      <p className="label menu__kicker">L'ardoise — 02</p>

      <h2 className="menu__heading" aria-label="Au menu">
        {"Au menu".split("").map((char, i) => (
          <span className="menu__char-mask" key={i}>
            <span className="char">{char === " " ? "\u00A0" : char}</span>
          </span>
        ))}
      </h2>

      <p className="menu__note">{menu.note}</p>

      <div className="menu__list">
        {menu.sections.map((section) => (
          <div className="menu__group" key={section.title}>
            <h3 className="menu__group-title">{section.title}</h3>
            {section.items.map((item, i) => (
              <div
                className="menu__row"
                key={`${section.title}-${i}`}
                onMouseEnter={() => showPreview(item.image)}
                onMouseLeave={hidePreview}
              >
                <div className="menu__row-text">
                  <p className="menu__row-name">{item.name}</p>
                  <p className="menu__row-desc">{item.desc}</p>
                </div>
                <span className="menu__row-dots" />
                <p className="menu__row-price">{item.price} €</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="menu__preview arch" ref={preview} aria-hidden="true">
        {previewSrc && <img src={previewSrc} alt="" />}
      </div>
    </section>
  );
}
