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

- Identifiants par défaut : `ferdibakha@icloud.com` / `damoui2022` — modifiables
  via les variables d'environnement `ADMIN_EMAIL` et `ADMIN_PASSWORD`.
- La carte et les photos uploadées vivent dans `server/storage/` (initialisé au
  premier démarrage depuis `server/data/menu.seed.json`).

### Variables d'environnement (production)

| Variable         | Rôle                                                        |
| ---------------- | ----------------------------------------------------------- |
| `ADMIN_EMAIL`    | E-mail de connexion à l'espace restaurateur                 |
| `ADMIN_PASSWORD` | Mot de passe de connexion                                   |
| `JWT_SECRET`     | Clé de signature des sessions — longue chaîne aléatoire     |
| `STORAGE_DIR`    | Dossier persistant (carte + photos), ex. point de montage du volume |
| `PORT`           | Injecté automatiquement par Railway, ne pas définir         |

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
