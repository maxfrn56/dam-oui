/**
 * API Dam'Oui — menu éditable, upload de photos, authentification.
 *
 * Variables d'environnement (optionnelles) :
 * - PORT            (défaut 3001)
 * - ADMIN_PASSWORD  (défaut "damoui2022")
 * - JWT_SECRET      (à définir en production)
 */
import express from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT ?? 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "damoui2022";
const JWT_SECRET = process.env.JWT_SECRET ?? "damoui-dev-secret";

const MENU_FILE = path.join(__dirname, "data", "menu.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

/* --- Authentification ------------------------------------ */

app.post("/api/login", (req, res) => {
  if (req.body?.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Mot de passe incorrect" });
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
