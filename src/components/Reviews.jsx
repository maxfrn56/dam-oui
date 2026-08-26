import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { REVIEWS } from "../data.js";
import "./Reviews.css";

export default function Reviews() {
  const root = useRef(null);

  useGSAP(
    () => {
      /* Compteur 0,0 -> 4,9 déclenché à l'arrivée dans la section */
      const score = { value: 0 };
      const scoreEl = root.current.querySelector(".reviews__score-value");
      gsap.to(score, {
        value: 4.9,
        duration: 1.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ".reviews__score", start: "top 75%" },
        onUpdate: () => {
          scoreEl.textContent = score.value.toFixed(1).replace(".", ",");
        },
      });

      gsap.from(".reviews__star", {
        scale: 0,
        rotate: -90,
        duration: 0.7,
        stagger: 0.09,
        ease: "back.out(2)",
        scrollTrigger: { trigger: ".reviews__score", start: "top 75%" },
      });

      gsap.from(".reviews__card", {
        opacity: 0,
        y: 70,
        rotate: (i) => (i % 2 ? 2 : -2),
        duration: 1.1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: ".reviews__grid", start: "top 80%" },
      });
    },
    { scope: root }
  );

  return (
    <section className="reviews section" id="avis" ref={root}>
      <p className="label">Ils en parlent — 04</p>

      <div className="reviews__score">
        <p className="reviews__score-value">0,0</p>
        <div className="reviews__score-detail">
          <div className="reviews__stars" aria-label="4,9 étoiles sur 5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className="reviews__star" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
              </svg>
            ))}
          </div>
          <p>{REVIEWS.count}</p>
        </div>
      </div>

      <div className="reviews__grid">
        {REVIEWS.quotes.map((quote) => (
          <blockquote className="reviews__card" key={quote.author}>
            <p className="reviews__quote">“{quote.text}”</p>
            <footer>
              <cite>{quote.author}</cite>
              <span>{quote.source}</span>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
