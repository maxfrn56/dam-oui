import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { GALLERY } from "../data.js";
import "./Gallery.css";

export default function Gallery() {
  const root = useRef(null);
  const track = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 761px)", () => {
        const distance = () => track.current.scrollWidth - window.innerWidth;

        const scrollTween = gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
          },
        });

        /* Léger effet de profondeur sur chaque image pendant la traversée */
        gsap.utils.toArray(".gallery__item img").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: img.parentElement,
                containerAnimation: scrollTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        });
      });

      mm.add("(max-width: 760px)", () => {
        gsap.utils.toArray(".gallery__item").forEach((item) => {
          gsap.from(item, {
            opacity: 0,
            y: 60,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 85%" },
          });
        });
      });
    },
    { scope: root }
  );

  return (
    <section className="gallery" id="galerie" ref={root}>
      <div className="gallery__track" ref={track}>
        <div className="gallery__intro">
          <p className="label">Galerie — 03</p>
          <h2>
            L'ambiance,
            <br />
            <em>en images</em>
          </h2>
        </div>

        {GALLERY.map((item) => (
          <figure
            className={`gallery__item ${item.size ? `gallery__item--${item.size}` : ""}`}
            key={item.src}
            data-cursor="view"
          >
            <img src={item.src} alt={item.alt} loading="lazy" />
            <figcaption>{item.alt}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
