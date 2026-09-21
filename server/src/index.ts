import { env } from "./env";
import { createApp } from "./app";
import { startSyncScheduler } from "./jobs/syncScheduler";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Servidor Finanzas escuchando en http://localhost:${env.PORT} (${env.NODE_ENV})`);
  startSyncScheduler();
});
