import { useEffect, useMemo, useState } from "react";
import { getReservations, updateReservation } from "../lib/api.js";

function todayISO() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function formatDate(date) {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export default function Reservations() {
  const [date, setDate] = useState(todayISO());
  const [mode, setMode] = useState("day");
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);

  const load = () => {
    const params = mode === "day" ? { date } : { from: todayISO() };
    getReservations(params)
      .then((data) => setList(data.reservations))
      .catch((err) => setError(err.message));
  };

  useEffect(load, [date, mode]);

  const toggle = async (item) => {
    const next = item.status === "confirmed" ? "cancelled" : "confirmed";
    try {
      await updateReservation(item.id, next);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const covers = useMemo(
    () => list.filter((r) => r.status === "confirmed").reduce((sum, r) => sum + r.covers, 0),
    [list]
  );

  return (
    <section className="admin__section">
      <div className="admin__toolbar">
        <div className="admin__seg">
          <button className={mode === "day" ? "is-active" : ""} onClick={() => setMode("day")}>
            Par jour
          </button>
          <button className={mode === "upcoming" ? "is-active" : ""} onClick={() => setMode("upcoming")}>
            À venir
          </button>
        </div>
        {mode === "day" && (
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        )}
        <p className="admin__hint">{covers} couvert{covers > 1 ? "s" : ""} confirmé{covers > 1 ? "s" : ""}</p>
      </div>

      {error && <p className="admin__error">{error}</p>}

      {list.length === 0 && <p className="admin__hint">Aucune réservation.</p>}

      <ul className="resa-list">
        {list.map((item) => (
          <li key={item.id} className={`resa ${item.status === "cancelled" ? "is-cancelled" : ""}`}>
            <div className="resa__when">
              <strong>{item.time}</strong>
              <span>{formatDate(item.date)}</span>
            </div>
            <div className="resa__who">
              <strong>
                {item.firstName} {item.lastName}
              </strong>
              <span>
                {item.covers} couvert{item.covers > 1 ? "s" : ""}
              </span>
            </div>
            <div className="resa__contact">
              <a href={`tel:${item.phone}`}>{item.phone}</a>
              <a href={`mailto:${item.email}`}>{item.email}</a>
            </div>
            <button className="admin__btn" onClick={() => toggle(item)}>
              {item.status === "cancelled" ? "Rétablir" : "Annuler"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
