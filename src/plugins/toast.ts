import VueToastificationPlugin from "vue-toastification";
import "vue-toastification/dist/index.css";

import type { App } from "vue";

export default function (app: App) {
  app.use(VueToastificationPlugin);
}
