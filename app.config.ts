const HOST_DOMAIN = false
  ? // import.meta.env.DEV
    "http://localhost:5291"
  : "https://mangment-hotels.onrender.com";

const API_URL = `${HOST_DOMAIN}/api/admin/`;

export { API_URL, HOST_DOMAIN };
