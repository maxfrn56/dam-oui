# Dam'Oui — Site vitrine premium

Site immersif pour le restaurant **Dam'Oui** à Saint-Pierre-Quiberon.
Direction artistique inspirée du lieu : tons sable, pierre apparente, arches
marocaines, néon corail.

## Stack

- [Vite](https://vitejs.dev) + React 19 + React Router
- [GSAP](https://gsap.com) — ScrollTrigger, SplitText, DrawSVG
- [Lenis](https://lenis.darkroom.engineering) — smooth scroll
- [Express](https://expressjs.com) — API menu, upload de photos (multer), auth JWT

## Lancer le projet

```bash
npm install
npm run dev        # front (5173) + API (3001) en parallèle
```

En production : `npm run build` puis `npm start` (Express sert le site buildé et l'API).

## Espace restaurateur

Rendez-vous sur `/admin` pour modifier la carte en autonomie : nom, description,
prix et photo de chaque plat, ajout/suppression de plats, texte d'introduction.
Les changements sont visibles sur le site dès l'enregistrement.

- Mot de passe par défaut : `damoui2022` — changez-le via la variable
  d'environnement `ADMIN_PASSWORD` (et définissez `JWT_SECRET` en production).
- La carte est stockée dans `server/data/menu.json`, les photos uploadées dans
  `server/uploads/`.

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
