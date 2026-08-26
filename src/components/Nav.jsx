import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { RESTAURANT } from "../data.js";
import "./Nav.css";

const LINKS = [
  { label: "La maison", href: "#maison" },
  { label: "L'ardoise", href: "#ardoise" },
  { label: "Galerie", href: "#galerie" },
  { label: "Avis", href: "#avis" },
];

export default function Nav({ ready }) {
  const root = useRef(null);

  useGSAP(
    () => {
      /* Passe en fond clair une fois le hero quitté */
      ScrollTrigger.create({
        start: () => window.innerHeight * 0.8,
        end: "max",
        toggleClass: { targets: root.current, className: "nav-wrap--solid" },
      });
    },
    { scope: root }
  );

  useGSAP(
    () => {
      if (!ready) return;
      gsap.from(".nav > *", {
        y: -24,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.4,
      });
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <header className="nav-wrap" ref={root}>
      <nav className="nav">
        <a className="nav__brand" href="#top" aria-label="Dam'Oui — retour en haut">
          <img className="nav__logo nav__logo--light" src="/images/logo-light.png" alt="" />
          <img className="nav__logo nav__logo--dark" src="/images/logo-dark.png" alt="" />
        </a>
        <ul className="nav__links">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
        <a className="nav__cta" href={RESTAURANT.phoneHref}>
          Réserver
        </a>
      </nav>
    </header>
  );
}
