// ── Central API helper — all fetch calls go through here ─────────────────────
const API_BASE = "/api";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: "Bearer " + getToken(),
  "Cache-Control": "no-cache",
});

const request = async (method, path, body = null) => {
  const options = { method, headers: authHeaders() };
  if (body) options.body = JSON.stringify(body);

  const res  = await fetch(API_BASE + path, options);

  // Token expired or invalid → redirect to login
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/pages/login.html";
    return;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");

  // Unwrap { success, message, data } envelope
  return data.data !== undefined ? data.data : data;
};

const api = {
  get:    (path)        => request("GET",    path),
  post:   (path, body)  => request("POST",   path, body),
  put:    (path, body)  => request("PUT",    path, body),
  delete: (path)        => request("DELETE", path),

  // Raw fetch for CSV (non-JSON response)
  download: async (path, filename) => {
    const res = await fetch(API_BASE + path, { headers: authHeaders() });
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },
};

window.api = api;
