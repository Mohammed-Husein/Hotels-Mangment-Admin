import { createApp } from "vue";
import "tailwindcss/tailwind.css";
import "maz-ui/css/main.css";
import MazPhoneNumberInput from "maz-ui/components/MazPhoneNumberInput";
import App from "@/App.vue";
import { registerPlugins } from "@core/utils/plugins";

// Styles
import "@core/scss/template/index.scss";
import "@styles/styles.scss";

// Create vue app
const app = createApp(App);
app.component("MazPhoneNumberInput", MazPhoneNumberInput);

// Register plugins
registerPlugins(app);

// Mount vue app
app.mount("#app");
