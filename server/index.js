/**
 * API Dam'Oui — menu éditable, upload de photos, authentification.
 *
 * Variables d'environnement (optionnelles en dev, à définir en production) :
 * - PORT            (défaut 3001 — injecté automatiquement par Railway)
 * - ADMIN_EMAIL     (défaut "ferdibakha@icloud.com")
 * - ADMIN_PASSWORD  (défaut "damoui2022")
 * - JWT_SECRET      (obligatoire en production)
 * - STORAGE_DIR     (défaut server/storage — pointer vers le volume persistant)
 */
import express from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT ?? 3001;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "ferdibakha@icloud.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "damoui2022";
const JWT_SECRET = process.env.JWT_SECRET ?? "damoui-dev-secret";

/* Carte + photos dans un seul dossier : un unique volume suffit en prod.
   Au premier démarrage, la carte est initialisée depuis le seed committé. */
const STORAGE_DIR = process.env.STORAGE_DIR ?? path.join(__dirname, "storage");
const MENU_FILE = path.join(STORAGE_DIR, "menu.json");
const UPLOADS_DIR = path.join(STORAGE_DIR, "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(MENU_FILE)) {
  fs.copyFileSync(path.join(__dirname, "data", "menu.seed.json"), MENU_FILE);
}

const app = express();
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

/* --- Authentification ------------------------------------ */

app.post("/api/login", (req, res) => {
  const { email, password } = req.body ?? {};
  const emailOk = email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  if (!emailOk || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "E-mail ou mot de passe incorrect" });
  }
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token });
});

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Session expirée, reconnectez-vous" });
  }
}

/* --- Menu ------------------------------------------------- */

app.get("/api/menu", (_req, res) => {
  res.json(JSON.parse(fs.readFileSync(MENU_FILE, "utf8")));
});

app.put("/api/menu", requireAuth, (req, res) => {
  const { note, sections } = req.body ?? {};
  if (typeof note !== "string" || !Array.isArray(sections)) {
    return res.status(400).json({ error: "Format de menu invalide" });
  }
  fs.writeFileSync(MENU_FILE, JSON.stringify({ note, sections }, null, 2));
  res.json({ ok: true });
});

/* --- Upload de photos ------------------------------------- */

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `plat-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    cb(null, /^image\/(jpeg|png|webp|avif)$/.test(file.mimetype)),
});

app.post("/api/upload", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Image invalide (jpeg, png, webp, avif — 8 Mo max)" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

/* --- Site buildé (production) ------------------------------ */

const DIST_DIR = path.join(__dirname, "..", "dist");
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(DIST_DIR, "index.html")));
}

app.listen(PORT, () => console.log(`API Dam'Oui → http://localhost:${PORT}`));
