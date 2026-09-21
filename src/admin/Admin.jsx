import { useEffect, useState } from "react";
import { getMenu, getToken, clearToken, login, saveMenu, uploadImage } from "../lib/api.js";
import "./Admin.css";

export default function Admin() {
  const [authed, setAuthed] = useState(Boolean(getToken()));
  return authed ? (
    <Editor onLogout={() => { clearToken(); setAuthed(false); }} />
  ) : (
    <Login onSuccess={() => setAuthed(true)} />
  );
}

/* --- Connexion -------------------------------------------- */

function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin admin--login">
      <form className="admin__login-card" onSubmit={submit}>
        <img src="/images/logo-dark.png" alt="Dam'Oui" className="admin__logo" />
        <h1>Espace restaurateur</h1>
        <p className="admin__hint">Connectez-vous pour modifier la carte.</p>
        <input
          type="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          autoFocus
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <p className="admin__error">{error}</p>}
        <button type="submit" className="admin__btn admin__btn--primary">
          Se connecter
        </button>
      </form>
    </div>
  );
}

/* --- Éditeur de carte -------------------------------------- */

function Editor({ onLogout }) {
  const [menu, setMenu] = useState(null);
  const [status, setStatus] = useState(null); // null | "saving" | "saved" | message d'erreur

  useEffect(() => {
    getMenu().then(setMenu).catch((err) => setStatus(err.message));
  }, []);

  const updateItem = (sIdx, iIdx, patch) => {
    setMenu((prev) => {
      const next = structuredClone(prev);
      Object.assign(next.sections[sIdx].items[iIdx], patch);
      return next;
    });
    setStatus(null);
  };

  const addItem = (sIdx) => {
    setMenu((prev) => {
      const next = structuredClone(prev);
      next.sections[sIdx].items.push({ name: "", desc: "", price: "", image: "" });
      return next;
    });
    setStatus(null);
  };

  const removeItem = (sIdx, iIdx) => {
    setMenu((prev) => {
      const next = structuredClone(prev);
      next.sections[sIdx].items.splice(iIdx, 1);
      return next;
    });
    setStatus(null);
  };

  const changePhoto = async (sIdx, iIdx, file) => {
    if (!file) return;
    try {
      const { url } = await uploadImage(file);
      updateItem(sIdx, iIdx, { image: url });
    } catch (err) {
      setStatus(err.message);
    }
  };

  const save = async () => {
    setStatus("saving");
    try {
      await saveMenu(menu);
      setStatus("saved");
    } catch (err) {
      setStatus(err.message);
    }
  };

  if (!menu) return <div className="admin admin--loading">Chargement…</div>;

  return (
    <div className="admin">
      <header className="admin__header">
        <img src="/images/logo-dark.png" alt="Dam'Oui" className="admin__logo" />
        <div>
          <h1>La carte</h1>
          <p className="admin__hint">
            Modifiez vos plats puis cliquez sur « Enregistrer » : le site est mis à jour
            immédiatement.
          </p>
        </div>
        <div className="admin__header-actions">
          <a href="/" target="_blank" rel="noreferrer" className="admin__btn">
            Voir le site
          </a>
          <button onClick={onLogout} className="admin__btn">
            Déconnexion
          </button>
        </div>
      </header>

      <label className="admin__note">
        <span>Texte d'introduction de l'ardoise</span>
        <textarea
          rows={2}
          value={menu.note}
          onChange={(e) => setMenu({ ...menu, note: e.target.value })}
        />
      </label>

      {menu.sections.map((section, sIdx) => (
        <section className="admin__section" key={section.title}>
          <h2>{section.title}</h2>

          {section.items.map((item, iIdx) => (
            <article className="admin__item" key={iIdx}>
              <label className="admin__photo">
                {item.image ? <img src={item.image} alt="" /> : <span>Photo</span>}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => changePhoto(sIdx, iIdx, e.target.files[0])}
                />
              </label>

              <div className="admin__fields">
                <input
                  placeholder="Nom du plat"
                  value={item.name}
                  onChange={(e) => updateItem(sIdx, iIdx, { name: e.target.value })}
                />
                <input
                  placeholder="Description"
                  value={item.desc}
                  onChange={(e) => updateItem(sIdx, iIdx, { desc: e.target.value })}
                />
              </div>

              <input
                className="admin__price"
                placeholder="Prix"
                value={item.price}
                onChange={(e) => updateItem(sIdx, iIdx, { price: e.target.value })}
              />

              <button
                className="admin__delete"
                onClick={() => removeItem(sIdx, iIdx)}
                title="Supprimer ce plat"
              >
                ✕
              </button>
            </article>
          ))}

          <button className="admin__btn admin__btn--add" onClick={() => addItem(sIdx)}>
            + Ajouter un plat
          </button>
        </section>
      ))}

      <footer className="admin__footer">
        {status === "saved" && <p className="admin__saved">Carte enregistrée ✓</p>}
        {status && status !== "saving" && status !== "saved" && (
          <p className="admin__error">{status}</p>
        )}
        <button
          className="admin__btn admin__btn--primary"
          onClick={save}
          disabled={status === "saving"}
        >
          {status === "saving" ? "Enregistrement…" : "Enregistrer la carte"}
        </button>
      </footer>
    </div>
  );
}
