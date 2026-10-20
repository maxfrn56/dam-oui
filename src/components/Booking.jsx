import { useEffect, useMemo, useState } from "react";
import { createReservation, getDayAvailability, getMonthAvailability } from "../lib/api.js";
import { useBooking } from "../lib/booking.jsx";
import "./Booking.css";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function monthKey(year, month) {
  return `${year}-${pad(month + 1)}`;
}

function formatLong(date) {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function buildGrid(year, month) {
  const first = new Date(Date.UTC(year, month, 1));
  const start = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells = Array.from({ length: start }, () => null);
  for (let d = 1; d <= days; d += 1) cells.push(`${year}-${pad(month + 1)}-${pad(d)}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

const EMPTY_FORM = { firstName: "", lastName: "", email: "", phone: "" };

export default function BookingModal() {
  const { open, closeBooking } = useBooking();
  const today = useMemo(() => new Date(), [open]);
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [covers, setCovers] = useState(2);
  const [maxCovers, setMaxCovers] = useState(10);
  const [days, setDays] = useState({});
  const [date, setDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [closedReason, setClosedReason] = useState(null);

  useEffect(() => {
    if (!open) return;
    setCursor({ y: today.getFullYear(), m: today.getMonth() });
    setCovers(2);
    setDate(null);
    setTime(null);
    setForm(EMPTY_FORM);
    setStep(1);
    setError(null);
    setDone(null);
    setSlots([]);
  }, [open, today]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("booking-open");
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove("booking-open");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    getMonthAvailability(monthKey(cursor.y, cursor.m), covers)
      .then((data) => {
        setDays(data.days);
        setMaxCovers(data.maxCovers ?? 10);
      })
      .catch((err) => setError(err.message));
  }, [open, cursor, covers]);

  useEffect(() => {
    if (!open || !date) return;
    setTime(null);
    getDayAvailability(date, covers)
      .then((data) => {
        setClosedReason(data.closed ? data.reason : null);
        setSlots(data.slots ?? []);
      })
      .catch((err) => setError(err.message));
  }, [open, date, covers]);

  if (!open) return null;

  const grid = buildGrid(cursor.y, cursor.m);
  const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(
    new Date(cursor.y, cursor.m, 1)
  );
  const grouped = slots.reduce((acc, slot) => {
    (acc[slot.service] ??= []).push(slot);
    return acc;
  }, {});

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { reservation } = await createReservation({ date, time, covers, ...form });
      setDone(reservation);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="booking" role="dialog" aria-modal="true" aria-labelledby="booking-title">
      <button className="booking__backdrop" onClick={closeBooking} aria-label="Fermer" />
      <div className="booking__panel">
        <header className="booking__head">
          <p className="label">Dam'Oui</p>
          <h2 id="booking-title">Réserver une table</h2>
          <button className="booking__close" onClick={closeBooking} aria-label="Fermer">
            ✕
          </button>
        </header>

        {step < 4 && (
          <ol className="booking__steps" aria-hidden="true">
            {["Date", "Horaire", "Coordonnées"].map((label, i) => (
              <li key={label} className={step === i + 1 ? "is-active" : step > i + 1 ? "is-done" : ""}>
                {label}
              </li>
            ))}
          </ol>
        )}

        {error && <p className="booking__error">{error}</p>}

        {step === 1 && (
          <div className="booking__body">
            <div className="booking__covers">
              <span>Couverts</span>
              <div>
                <button type="button" onClick={() => setCovers((n) => Math.max(1, n - 1))} aria-label="Moins">
                  −
                </button>
                <strong>{covers}</strong>
                <button type="button" onClick={() => setCovers((n) => Math.min(maxCovers, n + 1))} aria-label="Plus">
                  +
                </button>
              </div>
            </div>

            <div className="booking__cal-nav">
              <button
                type="button"
                onClick={() =>
                  setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }))
                }
              >
                ‹
              </button>
              <p>{monthLabel}</p>
              <button
                type="button"
                onClick={() =>
                  setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }))
                }
              >
                ›
              </button>
            </div>

            <div className="booking__week">
              {WEEKDAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="booking__grid">
              {grid.map((cell, i) => {
                if (!cell) return <span key={i} />;
                const status = days[cell]?.status;
                const disabled = status !== "open";
                return (
                  <button
                    key={cell}
                    type="button"
                    className={`booking__day ${date === cell ? "is-selected" : ""} is-${status}`}
                    disabled={disabled}
                    onClick={() => setDate(cell)}
                  >
                    {Number(cell.slice(-2))}
                  </button>
                );
              })}
            </div>

            <button
              className="booking__next"
              type="button"
              disabled={!date}
              onClick={() => setStep(2)}
            >
              Choisir l'horaire
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="booking__body">
            <p className="booking__chosen">
              {covers} couvert{covers > 1 ? "s" : ""} · {formatLong(date)}
            </p>
            {closedReason && <p className="booking__muted">{closedReason}</p>}
            {Object.entries(grouped).map(([service, list]) => (
              <div key={service} className="booking__service">
                <h3>{service}</h3>
                <div className="booking__times">
                  {list.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      className={time === slot.time ? "is-selected" : ""}
                      disabled={!slot.available}
                      onClick={() => setTime(slot.time)}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!slots.some((s) => s.available) && !closedReason && (
              <p className="booking__muted">Plus de place à cette date pour {covers} couverts.</p>
            )}
            <div className="booking__actions">
              <button type="button" className="booking__ghost" onClick={() => setStep(1)}>
                Retour
              </button>
              <button className="booking__next" type="button" disabled={!time} onClick={() => setStep(3)}>
                Continuer
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form className="booking__body" onSubmit={submit}>
            <p className="booking__chosen">
              {covers} couvert{covers > 1 ? "s" : ""} · {formatLong(date)} · {time}
            </p>
            <div className="booking__fields">
              <input
                required
                placeholder="Prénom"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                autoComplete="given-name"
              />
              <input
                required
                placeholder="Nom"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                autoComplete="family-name"
              />
              <input
                required
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
              <input
                required
                type="tel"
                placeholder="Téléphone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                autoComplete="tel"
              />
            </div>
            <div className="booking__actions">
              <button type="button" className="booking__ghost" onClick={() => setStep(2)}>
                Retour
              </button>
              <button className="booking__next" type="submit" disabled={busy}>
                {busy ? "Réservation…" : "Confirmer la table"}
              </button>
            </div>
          </form>
        )}

        {step === 4 && done && (
          <div className="booking__success">
            <p className="booking__script">À très vite</p>
            <p>
              {done.firstName}, votre table pour {done.covers} est confirmée le {formatLong(done.date)} à{" "}
              {done.time}. Un e-mail de confirmation vient de partir vers {done.email}.
            </p>
            <button className="booking__next" type="button" onClick={closeBooking}>
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
