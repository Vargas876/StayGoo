/**
 * api.js — Capa de comunicación con el Backend de StayGo
 * Todos los servicios que hablan con el servidor van aquí.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ── Helper genérico para hacer peticiones ──────────────────────────────────────
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("staygooToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Error en el servidor");
  }

  return data;
}

// ── AUTH ───────────────────────────────────────────────────────────────────────

/**
 * Registrar un nuevo usuario
 * @param {Object} userData - Datos del formulario de registro
 */
export async function registerUser(userData) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

/**
 * Iniciar sesión
 * @param {string} email
 * @param {string} password
 */
export async function loginUser(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Cerrar sesión
 */
export async function logoutUser() {
  return request("/auth/logout", { method: "POST" });
}

// ── USERS ──────────────────────────────────────────────────────────────────────

/**
 * Obtener perfil del usuario autenticado
 */
export async function getMyProfile() {
  return request("/users/me");
}

/**
 * Actualizar perfil del usuario autenticado
 * @param {Object} updates
 */
export async function updateMyProfile(updates) {
  return request("/users/me", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

// ── HOUSINGS ───────────────────────────────────────────────────────────────────

/**
 * Obtener todos los alojamientos
 */
export async function getHousings() {
  return request("/housings");
}

/**
 * Obtener un alojamiento por ID
 * @param {string|number} id
 */
export async function getHousingById(id) {
  return request(`/housings/${id}`);
}

/**
 * Crear un alojamiento (solo hosts)
 * @param {Object} housingData
 */
export async function createHousing(housingData) {
  return request("/housings", {
    method: "POST",
    body: JSON.stringify(housingData),
  });
}

/**
 * Actualizar un alojamiento (solo hosts)
 * @param {string|number} id
 * @param {Object} housingData
 */
export async function updateHousing(id, housingData) {
  return request(`/housings/${id}`, {
    method: "PUT",
    body: JSON.stringify(housingData),
  });
}

// ── BOOKINGS ───────────────────────────────────────────────────────────────────

/**
 * Crear una reserva
 * @param {Object} bookingData
 */
export async function createBooking(bookingData) {
  return request("/bookings", {
    method: "POST",
    body: JSON.stringify(bookingData),
  });
}

/**
 * Obtener reservas del usuario autenticado (viajes)
 */
export async function getMyBookings() {
  return request("/bookings/me");
}

/**
 * Obtener reservas asociadas a los alojamientos del host
 */
export async function getHostBookings() {
  return request("/bookings/host");
}

// ── REVIEWS ────────────────────────────────────────────────────────────────────

/**
 * Obtener reseñas de un alojamiento
 * @param {string|number} housingId
 */
export async function getReviewsByHousing(housingId) {
  return request(`/reviews?housing_id=${housingId}`);
}

/**
 * Crear una reseña
 * @param {Object} reviewData
 */
export async function createReview(reviewData) {
  return request("/reviews", {
    method: "POST",
    body: JSON.stringify(reviewData),
  });
}

// ── NOTIFICATIONS ──────────────────────────────────────────────────────────────

/**
 * Obtener notificaciones del usuario autenticado
 */
export async function getNotifications() {
  return request("/notifications");
}

// ── MESSAGES ───────────────────────────────────────────────────────────────────

/**
 * Obtener mensajes del usuario autenticado
 */
export async function getMessages() {
  return request("/messages");
}

/**
 * Enviar un mensaje
 * @param {Object} messageData
 */
export async function sendMessage(messageData) {
  return request("/messages", {
    method: "POST",
    body: JSON.stringify(messageData),
  });
}
