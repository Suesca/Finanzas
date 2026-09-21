import type { CapacitorConfig } from "@capacitor/cli";

// Server.url apunta la WebView nativa directo al servidor Express que sirve
// tanto la API como el cliente (mismo origen) — así el login por cookie
// httpOnly funciona igual que en el navegador, sin CORS ni tokens extra.
//
// Para pruebas en tu red local: http://192.168.2.4:4000
// Cuando despliegues en Render, cambia esta URL por la del servidor real
// (https://tu-app.onrender.com) y vuelve a generar el APK.
const config: CapacitorConfig = {
  appId: "com.danielsuesca.finanzas",
  appName: "Finanzas",
  webDir: "dist",
  server: {
    url: "http://192.168.2.4:4000",
    cleartext: true,
  },
};

export default config;
