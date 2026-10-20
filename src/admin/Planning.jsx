import { useEffect, useState } from "react";
import { getBookingSettings, getDayAvailability, saveBookingSettings } from "../lib/api.js";

const DAYS = [
  { id: 1, label: "Lundi" },
  { id: 2, label: "Mardi" },
  { id: 3, label: "Mercredi" },
  { id: 4, label: "Jeudi" },
  { id: 5, label: "Vendredi" },
  { id: 6, label: "Samedi" },
  { id: 0, label: "Dimanche" },
];

function slotKey(date, time) {
  return `${date}|${time}`;
}

export default function Planning() {
  const [settings, setSettings] = useState(null);
  const [inspect, setInspect] = useState("");
  const [slots, setSlots] = useState([]);
  const [status, setStatus] = useState(null);
  const [closure, setClosure] = useState("");

  useEffect(() => {
    getBookingSettings().then(setSettings).catch((err) => setStatus(err.message));
  }, []);

  useEffect(() => {
    if (!inspect) return;
    getDayAvailability(inspect, 1)
      .then((data) => setSlots(data.slots ?? []))
      .catch((err) => setStatus(err.message));
  }, [inspect, settings]);

  if (!settings) return <p className="admin__hint">Chargement du planning…</p>;

  const patch = (next) => {
    setSettings(next);
    setStatus(null);
  };

  const toggleDay = (id) => {
    const weeklyClosedDays = settings.weeklyClosedDays.includes(id)
      ? settings.weeklyClosedDays.filter((d) => d !== id)
      : [...settings.weeklyClosedDays, id];
    patch({ ...settings, weeklyClosedDays });
  };

  const addClosure = () => {
    if (!closure || settings.exceptionalClosures.includes(closure)) return;
    patch({ ...settings, exceptionalClosures: [...settings.exceptionalClosures, closure].sort() });
    setClosure("");
  };

  const toggleBlock = (time) => {
    const key = slotKey(inspect, time);
    const blockedSlots = settings.blockedSlots.includes(key)
      ? settings.blockedSlots.filter((k) => k !== key)
      : [...settings.blockedSlots, key];
    patch({ ...settings, blockedSlots });
  };

  const setSlotCapacity = (time, value) => {
    patch({ ...settings, slotCapacities: { ...settings.slotCapacities, [time]: Number(value) } });
  };

  const updateService = (i, field, value) => {
    const services = settings.services.map((s, idx) => (idx === i ? { ...s, [field]: value } : s));
    patch({ ...settings, services });
  };

  const save = async () => {
    setStatus("saving");
    try {
      const saved = await saveBookingSettings(settings);
      setSettings(saved);
      setStatus("saved");
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <>
      <section className="admin__section">
        <h2>Fermetures hebdomadaires</h2>
        <p className="admin__hint">Les jours cochés n'acceptent aucune réservation.</p>
        <div className="planning__days">
          {DAYS.map((day) => (
            <label key={day.id} className={settings.weeklyClosedDays.includes(day.id) ? "is-on" : ""}>
              <input
                type="checkbox"
                checked={settings.weeklyClosedDays.includes(day.id)}
                onChange={() => toggleDay(day.id)}
              />
              {day.label}
            </label>
          ))}
        </div>
      </section>

      <section className="admin__section">
        <h2>Fermetures exceptionnelles</h2>
        <div className="admin__toolbar">
          <input type="date" value={closure} onChange={(e) => setClosure(e.target.value)} />
          <button className="admin__btn" type="button" onClick={addClosure}>
            Ajouter
          </button>
        </div>
        <ul className="planning__closures">
          {settings.exceptionalClosures.map((d) => (
            <li key={d}>
              {d}
              <button
                className="admin__delete"
                onClick={() =>
                  patch({
                    ...settings,
                    exceptionalClosures: settings.exceptionalClosures.filter((x) => x !== d),
                  })
                }
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin__section">
        <h2>Services et capacités</h2>
        <p className="admin__hint">
          Capacité = nombre de couverts pouvant commencer à chaque créneau. Un override par horaire
          s'applique tous les jours.
        </p>
        {settings.services.map((service, i) => (
          <article className="planning__service" key={service.id}>
            <input
              value={service.label}
              onChange={(e) => updateService(i, "label", e.target.value)}
            />
            <label>
              Début
              <input
                type="time"
                value={service.start}
                onChange={(e) => updateService(i, "start", e.target.value)}
              />
            </label>
            <label>
              Fin
              <input
                type="time"
                value={service.end}
                onChange={(e) => updateService(i, "end", e.target.value)}
              />
            </label>
            <label>
              Intervalle
              <select
                value={service.interval}
                onChange={(e) => updateService(i, "interval", Number(e.target.value))}
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={60}>60 min</option>
              </select>
            </label>
            <label>
              Capacité
              <input
                type="number"
                min="0"
                value={service.capacity}
                onChange={(e) => updateService(i, "capacity", Number(e.target.value))}
              />
            </label>
          </article>
        ))}
        <label className="admin__note">
          <span>Maximum de couverts par réservation</span>
          <input
            type="number"
            min="1"
            max="20"
            value={settings.maxCovers}
            onChange={(e) => patch({ ...settings, maxCovers: Number(e.target.value) })}
          />
        </label>
      </section>

      <section className="admin__section">
        <h2>Créneaux d'un jour</h2>
        <p className="admin__hint">Bloquez un horaire précis ou ajustez sa capacité.</p>
        <input type="date" value={inspect} onChange={(e) => setInspect(e.target.value)} />
        {inspect && (
          <ul className="planning__slots">
            {slots.map((slot) => {
              const blocked = settings.blockedSlots.includes(slotKey(inspect, slot.time));
              const capacity = settings.slotCapacities[slot.time] ?? slot.capacity;
              return (
                <li key={slot.time}>
                  <strong>{slot.time}</strong>
                  <span>{slot.service}</span>
                  <span>
                    {slot.booked}/{capacity}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={capacity}
                    onChange={(e) => setSlotCapacity(slot.time, e.target.value)}
                    title="Capacité de ce créneau (tous les jours)"
                  />
                  <button
                    className={`admin__btn ${blocked ? "admin__btn--primary" : ""}`}
                    type="button"
                    onClick={() => toggleBlock(slot.time)}
                  >
                    {blocked ? "Bloqué" : "Bloquer"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="admin__footer">
        {status === "saved" && <p className="admin__saved">Planning enregistré ✓</p>}
        {status && status !== "saving" && status !== "saved" && (
          <p className="admin__error">{status}</p>
        )}
        <button className="admin__btn admin__btn--primary" onClick={save} disabled={status === "saving"}>
          {status === "saving" ? "Enregistrement…" : "Enregistrer le planning"}
        </button>
      </footer>
    </>
  );
}
