import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RESTAURANT } from "../data.js";
import "./Footer.css";

export default function Footer() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.from(".footer__neon", {
        opacity: 0,
        scale: 0.94,
        duration: 1.4,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });

      gsap.from(".footer__col", {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".footer__grid", start: "top 85%" },
      });
    },
    { scope: root }
  );

  return (
    <footer className="footer" id="contact" ref={root}>
      <div className="footer__neon-wrap">
        <p className="footer__neon">Dam'oui</p>
        <p className="footer__tagline label">On vous attend sur la presqu'île</p>
      </div>

      <div className="footer__grid">
        <div className="footer__col">
          <h3 className="label">Adresse</h3>
          <a href={RESTAURANT.mapsUrl} target="_blank" rel="noreferrer">
            15 Rue Général de Gaulle
            <br />
            56510 Saint-Pierre-Quiberon
          </a>
        </div>

        <div className="footer__col">
          <h3 className="label">Horaires</h3>
          <ul>
            {RESTAURANT.hours.map((slot) => (
              <li key={slot.day}>
                <span>{slot.day}</span>
                <span>{slot.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="label">Contact</h3>
          <a href={RESTAURANT.phoneHref}>{RESTAURANT.phone}</a>
          <a href={RESTAURANT.instagram} target="_blank" rel="noreferrer">
            Instagram — @damoui
          </a>
        </div>

        <div className="footer__col footer__col--cta">
          <a className="footer__reserve" href={RESTAURANT.phoneHref} data-cursor="view">
            <span>Réserver une table</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} Dam'Oui — SPQ · Since 2022</p>
        <p>Prix par personne : 20–30 €</p>
        <Link className="footer__admin" to="/admin">
          Espace restaurateur
        </Link>
      </div>
    </footer>
  );
}
