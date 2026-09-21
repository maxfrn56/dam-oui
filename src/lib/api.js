const TOKEN_KEY = "damoui-admin-token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Erreur ${res.status}`);
  return body;
}

const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

export const getMenu = () => request("/api/menu");

export async function login(email, password) {
  const { token } = await request("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem(TOKEN_KEY, token);
}

export const saveMenu = (menu) =>
  request("/api/menu", {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(menu),
  });

export function uploadImage(file) {
  const form = new FormData();
  form.append("image", file);
  return request("/api/upload", { method: "POST", headers: authHeaders(), body: form });
}
