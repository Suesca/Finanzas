import type { CapacitorConfig } from "@capacitor/cli";

// Server.url apunta la WebView nativa directo al servidor Express que sirve
// tanto la API como el cliente (mismo origen) — así el login por cookie
// httpOnly funciona igual que en el navegador, sin CORS ni tokens extra.
//
// Servidor real desplegado en Render (HTTPS) — funciona desde cualquier lugar.
const config: CapacitorConfig = {
  appId: "com.danielsuesca.finanzas",
  appName: "Finanzas",
  webDir: "dist",
  server: {
    url: "https://finanzas-3ril.onrender.com",
  },
};

export default config;
