import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL });

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// ── Log a package view ─────────────────────────────────────────────────────────
// Call this when a user leaves a package detail page.
// view_duration = seconds spent on the page
export const logView = (package_id, view_duration = 0) =>
  api
    .post("/interactions/log", { package_id, action: "view", view_duration }, getAuthHeader())
    .catch(() => {});  // always silent — never block the UI

// ── Log a rating ──────────────────────────────────────────────────────────────
// Call this when a user submits a star rating (1–5)
export const logRating = (package_id, rating) =>
  api
    .post("/interactions/log", { package_id, action: "rating", rating }, getAuthHeader())
    .catch(() => {});

// ── Log a booking ─────────────────────────────────────────────────────────────
// Call this after a successful booking API call
export const logBooking = (package_id) =>
  api
    .post("/interactions/log", { package_id, action: "booking" }, getAuthHeader())
    .then(r => console.log("✅ Booking logged:", r.data))
    .catch(err => console.error("❌ logBooking failed:", err.response?.data || err.message));

// ── Get behaviour-based recommendations ───────────────────────────────────────
// Returns personalised packages based on views, ratings, bookings + interests
// Returns { success, count, has_data, results }
export const getBehaviourRecommendations = () =>
  api
    .post("/recommend/behaviour", {}, getAuthHeader())
    .then(r => r.data);