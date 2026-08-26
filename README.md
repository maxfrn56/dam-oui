# Dam'Oui — Site vitrine premium

Site immersif pour le restaurant **Dam'Oui** à Saint-Pierre-Quiberon.
Direction artistique inspirée du lieu : tons sable, pierre apparente, arches
marocaines, néon corail.

## Stack

- [Vite](https://vitejs.dev) + React 19
- [GSAP](https://gsap.com) — ScrollTrigger, SplitText, DrawSVG
- [Lenis](https://lenis.darkroom.engineering) — smooth scroll

## Lancer le projet

```bash
npm install
npm run dev
```

## Animations

| Élément    | Effet                                                      |
| ---------- | ---------------------------------------------------------- |
| Préloader  | Logo dessiné en SVG (DrawSVG), compteur, rideaux en stagger |
| Hero       | Révélation lettre à lettre, parallaxe de sortie au scroll   |
| Marquee    | Défilement infini, sens piloté par la direction du scroll   |
| La maison  | Texte révélé mot à mot (SplitText), arches en parallaxe croisée |
| L'ardoise  | Aperçu photo flottant qui suit le curseur au survol         |
| Galerie    | Scroll horizontal épinglé + profondeur par image            |
| Avis       | Compteur 0,0 → 4,9, étoiles en spring, cartes en stagger    |
| Footer     | Néon scripté avec halo et grésillement                      |

Le curseur personnalisé et le scroll horizontal se désactivent automatiquement
sur écrans tactiles.
