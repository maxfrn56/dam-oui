import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sendBookingEmails } from "./mail.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEEKDAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(total) {
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

function parisNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

function weekday(date) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}

function addDays(date, days) {
  const [y, m, d] = date.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

function serviceSlots(service) {
  const start = toMinutes(service.start);
  const end = toMinutes(service.end);
  const step = Number(service.interval) || 15;
  const times = [];
  for (let t = start; t <= end; t += step) times.push(fromMinutes(t));
  return times;
}

function findService(settings, time) {
  return settings.services.find((service) => serviceSlots(service).includes(time));
}

function slotKey(date, time) {
  return `${date}|${time}`;
}

function isClosed(settings, date) {
  if (settings.weeklyClosedDays.includes(weekday(date))) {
    return `Fermé le ${WEEKDAYS[weekday(date)]}`;
  }
  if (settings.exceptionalClosures.includes(date)) {
    return "Fermeture exceptionnelle";
  }
  return null;
}

function capacityFor(settings, time) {
  const service = findService(settings, time);
  if (!service) return 0;
  const override = settings.slotCapacities?.[time];
  return Number.isFinite(override) ? override : Number(service.capacity) || 0;
}

function bookedCovers(bookings, date, time) {
  return bookings
    .filter((b) => b.status === "confirmed" && b.date === date && b.time === time)
    .reduce((sum, b) => sum + Number(b.covers), 0);
}

function isPast(settings, date, time) {
  const now = parisNow();
  if (date < now.date) return true;
  if (date > now.date) return false;
  return toMinutes(time) < toMinutes(now.time) + (Number(settings.minAdvanceMinutes) || 0);
}

function allSlots(settings) {
  return settings.services.flatMap((service) =>
    serviceSlots(service).map((time) => ({ time, service: service.label, serviceId: service.id }))
  );
}

function dayAvailability(settings, bookings, date, covers = 1) {
  const closed = isClosed(settings, date);
  if (closed) return { date, closed: true, reason: closed, slots: [] };

  const slots = allSlots(settings).map((slot) => {
    const blocked = settings.blockedSlots.includes(slotKey(date, slot.time));
    const capacity = capacityFor(settings, slot.time);
    const booked = bookedCovers(bookings, date, slot.time);
    const remaining = Math.max(0, capacity - booked);
    const past = isPast(settings, date, slot.time);
    return {
      ...slot,
      capacity,
      booked,
      remaining,
      blocked,
      past,
      available: !blocked && !past && remaining >= covers && capacity > 0,
    };
  });

  return { date, closed: false, reason: null, slots };
}

export function createBookingStore(storageDir) {
  const settingsFile = path.join(storageDir, "booking-settings.json");
  const bookingsFile = path.join(storageDir, "bookings.json");
  const seedFile = path.join(__dirname, "data", "booking.seed.json");

  if (!fs.existsSync(settingsFile)) fs.copyFileSync(seedFile, settingsFile);
  if (!fs.existsSync(bookingsFile)) fs.writeFileSync(bookingsFile, "[]\n");

  const readSettings = () => JSON.parse(fs.readFileSync(settingsFile, "utf8"));
  const readBookings = () => JSON.parse(fs.readFileSync(bookingsFile, "utf8"));
  const writeSettings = (data) => fs.writeFileSync(settingsFile, JSON.stringify(data, null, 2));
  const writeBookings = (data) => fs.writeFileSync(bookingsFile, JSON.stringify(data, null, 2));

  let chain = Promise.resolve();
  const serial = (fn) => {
    const run = chain.then(fn);
    chain = run.catch(() => {});
    return run;
  };

  return { readSettings, readBookings, writeSettings, writeBookings, serial };
}

function sanitizeSettings(body) {
  if (!body || !Array.isArray(body.services) || body.services.length === 0) {
    throw new Error("Au moins un service (midi / soir) est requis");
  }
  return {
    weeklyClosedDays: (body.weeklyClosedDays ?? []).map(Number).filter((d) => d >= 0 && d <= 6),
    exceptionalClosures: (body.exceptionalClosures ?? []).filter((d) => DATE_RE.test(d)),
    blockedSlots: (body.blockedSlots ?? []).filter((k) => /^\d{4}-\d{2}-\d{2}\|\d{2}:\d{2}$/.test(k)),
    slotCapacities: Object.fromEntries(
      Object.entries(body.slotCapacities ?? {}).filter(([time]) => TIME_RE.test(time)).map(([time, value]) => [time, Math.max(0, Number(value) || 0)])
    ),
    maxCovers: Math.min(20, Math.max(1, Number(body.maxCovers) || 10)),
    horizonDays: Math.min(180, Math.max(7, Number(body.horizonDays) || 60)),
    minAdvanceMinutes: Math.max(0, Number(body.minAdvanceMinutes) || 0),
    services: body.services.map((s) => ({
      id: String(s.id || s.label || "service")
        .toLowerCase()
        .replace(/\s+/g, "-"),
      label: String(s.label || "Service").slice(0, 40),
      start: TIME_RE.test(s.start) ? s.start : "12:00",
      end: TIME_RE.test(s.end) ? s.end : "14:00",
      interval: [10, 15, 30, 60].includes(Number(s.interval)) ? Number(s.interval) : 15,
      capacity: Math.max(0, Number(s.capacity) || 0),
    })),
  };
}

function validateGuest(body) {
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim();
  const date = String(body.date ?? "");
  const time = String(body.time ?? "");
  const covers = Number(body.covers);

  if (firstName.length < 2 || lastName.length < 2) throw new Error("Nom et prénom requis");
  if (!EMAIL_RE.test(email)) throw new Error("Adresse e-mail invalide");
  if (phone.replace(/\D/g, "").length < 10) throw new Error("Numéro de téléphone invalide");
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) throw new Error("Créneau invalide");
  if (!Number.isInteger(covers) || covers < 1) throw new Error("Nombre de couverts invalide");
  return { firstName, lastName, email, phone, date, time, covers };
}

export function registerBookingRoutes(app, { requireAuth, store }) {
  app.get("/api/booking/month", (req, res) => {
    const month = String(req.query.month ?? "");
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: "Mois invalide (AAAA-MM)" });
    }
    const covers = Math.max(1, Number(req.query.covers) || 1);
    const settings = store.readSettings();
    const bookings = store.readBookings();
    const [y, m] = month.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const now = parisNow();
    const horizon = addDays(now.date, settings.horizonDays);
    const days = {};

    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = `${month}-${pad(d)}`;
      if (date < now.date || date > horizon) {
        days[date] = { status: "closed", reason: "Hors période" };
        continue;
      }
      const day = dayAvailability(settings, bookings, date, covers);
      if (day.closed) days[date] = { status: "closed", reason: day.reason };
      else if (!day.slots.some((s) => s.available)) days[date] = { status: "full" };
      else days[date] = { status: "open" };
    }

    res.json({ month, days, maxCovers: settings.maxCovers });
  });

  app.get("/api/booking/availability", (req, res) => {
    const date = String(req.query.date ?? "");
    const covers = Math.max(1, Number(req.query.covers) || 1);
    if (!DATE_RE.test(date)) return res.status(400).json({ error: "Date invalide" });
    const settings = store.readSettings();
    const now = parisNow();
    const horizon = addDays(now.date, settings.horizonDays);
    if (date < now.date || date > horizon) {
      return res.json({ date, closed: true, reason: "Date indisponible", slots: [], maxCovers: settings.maxCovers });
    }
    const day = dayAvailability(settings, store.readBookings(), date, covers);
    res.json({ ...day, maxCovers: settings.maxCovers });
  });

  app.post("/api/booking", (req, res) => {
    store
      .serial(async () => {
        const guest = validateGuest(req.body ?? {});
        const settings = store.readSettings();
        if (guest.covers > settings.maxCovers) {
          throw new Error(`Maximum ${settings.maxCovers} couverts par réservation`);
        }
        const day = dayAvailability(settings, store.readBookings(), guest.date, guest.covers);
        if (day.closed) throw new Error(day.reason);
        const slot = day.slots.find((s) => s.time === guest.time);
        if (!slot) throw new Error("Ce créneau n'existe pas");
        if (!slot.available) throw new Error("Ce créneau n'est plus disponible");

        const reservation = {
          id: `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          ...guest,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        };
        const bookings = store.readBookings();
        bookings.push(reservation);
        store.writeBookings(bookings);
        return reservation;
      })
      .then(async (reservation) => {
        sendBookingEmails(reservation).catch((err) => console.error("[mail]", err));
        res.status(201).json({ reservation });
      })
      .catch((err) => res.status(400).json({ error: err.message }));
  });

  app.get("/api/booking/settings", requireAuth, (_req, res) => {
    res.json(store.readSettings());
  });

  app.put("/api/booking/settings", requireAuth, (req, res) => {
    try {
      const settings = sanitizeSettings(req.body);
      store.writeSettings(settings);
      res.json(settings);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/booking/reservations", requireAuth, (req, res) => {
    const { from, to, date } = req.query;
    let list = store.readBookings();
    if (date) list = list.filter((b) => b.date === date);
    if (from) list = list.filter((b) => b.date >= from);
    if (to) list = list.filter((b) => b.date <= to);
    list.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    res.json({ reservations: list });
  });

  app.patch("/api/booking/reservations/:id", requireAuth, (req, res) => {
    const status = req.body?.status;
    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }
    const bookings = store.readBookings();
    const reservation = bookings.find((b) => b.id === req.params.id);
    if (!reservation) return res.status(404).json({ error: "Réservation introuvable" });
    reservation.status = status;
    store.writeBookings(bookings);
    res.json({ reservation });
  });
}
