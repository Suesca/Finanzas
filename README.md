# Finanzas

App personal de finanzas (uso individual). Registra ingresos, gastos fijos, gastos
hormiga (variables), una regla de ahorro y deudas; calcula en tiempo real cuánto te
queda disponible para gastar este mes. Incluye un módulo de conexión bancaria
desacoplado (mock por defecto, listo para Belvo) y es instalable como PWA desde el
celular.

## Stack

- **Frontend:** React + TypeScript + Vite, Tailwind CSS, PWA (`vite-plugin-pwa`), React Query.
- **Backend:** Node.js + Express + TypeScript, autenticación por PIN (JWT en cookie httpOnly).
- **Base de datos:** PostgreSQL vía [Neon](https://neon.tech) (free tier), con Prisma ORM.
- **Integración bancaria:** interfaz `BankAggregatorProvider` desacoplada, con un
  proveedor mock (datos de ejemplo) y un proveedor Belvo listo para credenciales reales.

En producción, el servidor Express sirve también el build estático del cliente — una
sola URL, sin problemas de CORS ni cookies entre orígenes.

## Estructura

```
Finanzas/
  server/     API Express + Prisma + integración bancaria
  client/     App React (Vite) + PWA
  neon.ts     Política de la base de datos Neon (branch, TTLs)
```

## Requisitos

- Node.js 18+
- Una base de datos Postgres. Este proyecto ya está enlazado a un proyecto Neon
  (`raspy-wave-14618524`, branch `production`) mediante el [Neon CLI](https://neon.com/docs/reference/neon-cli).
  Si empiezas de cero en otra máquina: `npm i -g neon@latest && neon login && neon link`.

## Correr en local

```bash
npm run install:all
```

Copia `server/.env` (ya existe con el `DATABASE_URL` real de Neon) y ajusta si quieres:

- `AUTH_PIN`: el PIN con el que entras a la app.
- `JWT_SECRET`: ya viene generado aleatoriamente.
- `BANK_PROVIDER=mock` por defecto (no requiere credenciales).

Aplica el esquema y siembra los datos iniciales (categorías, plantillas rápidas, deuda
y conexión bancaria de ejemplo):

```bash
npm run prisma:migrate
npm run prisma:seed
```

Levanta servidor + cliente juntos:

```bash
npm run dev
```

- Cliente: http://localhost:5173 (proxyea `/api` hacia el servidor)
- Servidor: http://localhost:4000

Entra con el PIN definido en `AUTH_PIN`.

## Probar desde el celular sin desplegar

Con el PC y el celular en la misma red Wi-Fi:

```bash
cd client && npx vite --host
```

Y abre `http://<ip-de-tu-pc>:5173` desde el navegador del celular (necesitarás también
exponer el servidor con `--host` o ajustar el proxy). Para uso real fuera de casa, despliega
la app (siguiente sección) — es más simple y permite instalarla como PWA con una URL fija.

## Desplegar (acceso desde el celular fuera de casa)

**Base de datos:** ya está en Neon (gratis, persistente). Nada que hacer aquí para producción,
solo asegúrate de que la migración esté aplicada contra el branch que uses en producción
(`neon config apply` / `npm run prisma:migrate deploy`).

**Servidor + cliente (una sola URL) en Render:**

1. Sube este repo a GitHub.
2. En [render.com](https://render.com) → New → Web Service → conecta el repo.
3. Configuración:
   - **Build command:** `npm run install:all && npm run build`
   - **Start command:** `npm start`
   - **Root directory:** raíz del repo (no `server/`)
4. Variables de entorno (Environment → Add Environment Variable), las mismas de
   `server/.env` / `.env.example`: `DATABASE_URL`, `AUTH_PIN`, `JWT_SECRET`, `NODE_ENV=production`,
   `BANK_PROVIDER=mock` (o `belvo` con sus credenciales).
5. Deploy. Render te da una URL tipo `https://finanzas-xxxx.onrender.com`.

El free tier de Render "duerme" el servicio tras inactividad (primer request tarda ~30s
en despertar) — normal para uso personal. Por eso el botón "Sincronizar ahora" existe como
respaldo al cron automático.

**Alternativa:** [Railway](https://railway.app) funciona igual de simple (build/start commands
similares) si prefieres créditos de uso en vez del sleep de Render.

**Instalar como PWA en el celular:** abre la URL desplegada en Chrome/Safari del celular →
menú → "Añadir a la pantalla de inicio". Queda como una app más, con ícono propio.

## Conexión bancaria real (Belvo)

Por defecto `BANK_PROVIDER=mock` usa datos de ejemplo (útil para desarrollar y probar sin
credenciales). Para conectar Belvo de verdad:

1. Crea una cuenta en [belvo.com](https://belvo.com) y obtén `secret_id` / `secret_password`
   (sandbox primero).
2. Configura `BANK_PROVIDER=belvo`, `BELVO_SECRET_ID`, `BELVO_SECRET_PASSWORD`, `BELVO_ENV`.
3. Vincula una cuenta con el **Connect Widget** de Belvo (no incluido en este MVP — es un
   flujo de UI de Belvo que corre en el frontend) y guarda el `link_id` resultante en
   `BELVO_LINK_ID`.
4. El resto de la app (sync, categorización, dashboard) funciona igual sin cambios, porque
   depende solo de la interfaz `BankAggregatorProvider` (`server/src/integrations/bankAggregator/`).

## Notas de diseño

- **"Restante para gastar"** = Ingresos del mes − Gastos fijos activos − Gastos variables
  del mes − Ahorro del mes (regla activa, fija o %). Las deudas se muestran aparte
  (informativas) y no restan de este cálculo.
- **Gastos hormiga en 2-3 taps:** botón flotante (+) → plantilla frecuente (si tiene monto
  por defecto, guarda al instante) o monto + categoría.
- **Categorización automática:** reglas por palabra clave (`server/src/services/keywordRules.ts`)
  aplicadas tanto a gastos manuales como a transacciones importadas del banco.
- **Sincronización bancaria:** polling cada `BANK_SYNC_INTERVAL_HOURS` horas (default 6),
  más botón manual. Errores nunca fallan en silencio: quedan en `BankConnection.lastError`
  y se muestran en un banner en toda la app.

## Próximos pasos sugeridos

- Conectar Belvo con credenciales reales (ver arriba) y añadir más bancos colombianos.
- Exportar reportes mensuales (CSV/Excel).
- Gráficas de tendencia de gasto por categoría a lo largo de varios meses.
- Notificaciones push (vía service worker) unos días antes de fechas de pago de deudas/fijos.
- Soporte offline real (cola de gastos registrados sin conexión, sincronizados al volver).
