# Dam'Oui — Site vitrine premium

Site immersif pour le restaurant **Dam'Oui** à Saint-Pierre-Quiberon.
Direction artistique inspirée du lieu : tons sable, pierre apparente, arches
marocaines, néon corail.

## Stack

- [Vite](https://vitejs.dev) + React 19 + React Router
- [GSAP](https://gsap.com) — ScrollTrigger, SplitText, DrawSVG
- [Lenis](https://lenis.darkroom.engineering) — smooth scroll
- [Express](https://expressjs.com) — API menu, réservations, upload de photos (multer), auth JWT
- [Resend](https://resend.com) — e-mails de confirmation client et alerte restaurateur

## Lancer le projet

```bash
npm install
npm run dev        # front (5173) + API (3001) en parallèle
```

En production : `npm run build` puis `npm start` (Express sert le site buildé et l'API).

## Espace restaurateur

Rendez-vous sur `/admin` :

- **Réservations** : liste du jour ou à venir, annulation / rétablissement
- **Planning** : fermetures hebdomadaires, fermetures exceptionnelles,
  blocage de créneaux, capacité par service et par horaire
- **La carte** : nom, description, prix et photo de chaque plat

Les changements sont visibles sur le site dès l'enregistrement.

Les clients réservent via le bouton **Réserver** (popup : date, heure,
couverts, nom, prénom, téléphone, e-mail). Un e-mail part vers le client
et un autre vers le restaurateur.

- Identifiants par défaut : `ferdibakha@icloud.com` / `damoui2022` — modifiables
  via les variables d'environnement `ADMIN_EMAIL` et `ADMIN_PASSWORD`.
- La carte, les photos, le planning et les réservations vivent dans
  `server/storage/` (volume persistant en production).

### Variables d'environnement (production / Railway)

| Variable              | Rôle                                                        |
| --------------------- | ----------------------------------------------------------- |
| `ADMIN_EMAIL`         | E-mail de connexion à l'espace restaurateur                 |
| `ADMIN_PASSWORD`      | Mot de passe de connexion                                   |
| `JWT_SECRET`          | Clé de signature des sessions — longue chaîne aléatoire     |
| `STORAGE_DIR`         | Dossier persistant (`/data` si volume monté sur `/data`)    |
| `RESEND_API_KEY`      | Clé API Resend (envoi des e-mails)                          |
| `RESEND_FROM`         | Expéditeur vérifié, ex. `Dam'Oui <reservations@domaine.fr>` |
| `RESEND_NOTIFY_EMAIL` | Destinataire des alertes (défaut : `ADMIN_EMAIL`)           |
| `PORT`                | Injecté automatiquement par Railway, ne pas définir         |

Sur Railway : attachez Resend (ou collez la clé créée sur [resend.com](https://resend.com)),
vérifiez un domaine d'envoi, puis renseignez `RESEND_FROM` avec une adresse de ce domaine.
Sans `RESEND_API_KEY`, les réservations s'enregistrent quand même mais aucun e-mail n'est envoyé.

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
