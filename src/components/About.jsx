import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import "./About.css";

const SERVICES = ["Terrasse", "Excellents cocktails", "Menu enfant"];

export default function About() {
  const root = useRef(null);

  useGSAP(
    () => {
      /* Le grand texte se révèle mot à mot, piloté par le scroll */
      const split = SplitText.create(".about__statement", { type: "words" });
      gsap.from(split.words, {
        opacity: 0.12,
        yPercent: 30,
        stagger: 0.06,
        ease: "none",
        scrollTrigger: {
          trigger: ".about__statement",
          start: "top 80%",
          end: "top 30%",
          scrub: true,
        },
      });

      /* Parallaxe croisée des deux arches */
      gsap.to(".about__arch--left", {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: ".about__visuals", start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.to(".about__arch--right", {
        yPercent: 16,
        ease: "none",
        scrollTrigger: { trigger: ".about__visuals", start: "top bottom", end: "bottom top", scrub: true },
      });

      gsap.from(".about__chef > *, .about__services li", {
        opacity: 0,
        y: 40,
        duration: 1.1,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about__chef", start: "top 78%" },
      });
    },
    { scope: root }
  );

  return (
    <section className="about section" id="maison" ref={root}>
      <p className="label about__kicker">La maison — 01</p>

      <h2 className="about__statement">
        Dans une atmosphère chaleureuse, entre pierre bretonne et esprit marocain, nous
        proposons une ardoise régulièrement modifiée au gré des produits de saison et des
        inspirations du chef.
      </h2>

      <div className="about__visuals">
        <figure className="about__arch about__arch--left arch" data-cursor="view">
          <img src="/images/neon-damoui.png" alt="Le néon Dam'oui et son bouquet séché" />
        </figure>
        <figure className="about__arch about__arch--right arch" data-cursor="view">
          <img src="/images/detail-vase.png" alt="Fleurs séchées devant le mur en pierre" />
        </figure>
      </div>

      <div className="about__chef">
        <p className="about__script">Ferdinand Bakha</p>
        <p>
          Autodidacte inspiré, longtemps saisonnier sur la presqu'île, Ferdinand ouvre sa
          propre enseigne en février 2023. Ici, la cuisine voyage : poissons de la criée,
          épices douces, dressages précis — et un accueil qui donne envie de revenir.
        </p>
        <ul className="about__services">
          {SERVICES.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
