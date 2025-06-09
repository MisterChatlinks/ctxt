# 🖥️ Monitor-TXT

## 🚀 Concept

**`mtxt | monitext`**, short for **Monitor-TXT**, is a lightweight, developer-friendly logging utility built for **real-time log monitoring**.

Its primary mission is to **eliminate silent failures** in web or backend applications by **forwarding your logs to our API**, where you can monitor them live.

---

## 📦 Installation

> **Note:** `Monitor-TXT` is currently in **beta**.

```bash
npm install monitor-txt@beta
```

After installation, initialize the runtime by running:

```bash
monitext
```

This command generates a file named `monitext.runtime.(js|cjs|ts)` at the root of your project. It exports a pre-configured instance of our logging utility (`mtxt`, `monitext`).

It will also attempt to auto-configure a path alias (`#monitext-runtime`) in:

* `package.json`
* `tsconfig.json`
* `deno.json`

---

## 🛠️ Importing

Compatible with **ESM**, **CommonJS**, and **TypeScript**.

### ESM / TypeScript

```ts
import { mtxt, monitext } from "#monitext-runtime";
```

### CommonJS

```js
const { mtxt, monitext } = require("#monitext-runtime");
```

---

## ✍️ Usage

`mtxt` is the **compact, inline** version — ideal for quick calls.

```ts
mtxt
  .info("Your message here", { yourMetaData: someInfo() }, { silent: false }) // Automatically loggued & sent to the remote API
```

`monitext` is the **explicit, verbose** version — ideal for clarity and log hygiene.

```ts
monitext
  .error("First error line", "Another line", "More info if needed")
  .withMeta({ yourMetaData })
  .config({ silent: true }) // Silences console output
  .send(); // Manualy loggued & sent to remote Api
```

---

## ⚙️ Configuration: `monitext.runtime.ts`

Once the runtime file is generated, you’ll find:

```ts
export const { mtxt, monitext } = defineMonitextRuntime({
  project_name: "<YOUR_PROJECT_NAME>",
  env: "node", // or "web"
  devMode: false,
  apiKey: "<YOUR_API_KEY>"
});
```

> 🧪 **devMode: `true`** keeps logs local (for debugging).
> 🔄 Set to `false` to start forwarding logs to the Monitor-TXT API.

---

## 🔍 How It Works

* All log methods are **async**. Logs are **batched and sent in the background**.
* Logs are **end-to-end encrypted** and sent over **HTTPS**.
* Running `monitext` sets up a **custom runtime file**, tailored to your project.
* Importing from `#monitext-runtime` gives you a **ready-to-use, preconfigured instance**.

---

## 🧠 Why Use It?

* Prevent silent failures
* Gain real-time visibility
* Make logs part of your dev workflow, not an afterthought
* Easily toggle between local/dev and production mode

---

## 💬 Final Notes

Thanks for checking out **Monitor-TXT**!

📢 **Contribute, raise issues, or follow development at:**

👉 [https://github.com/MisterChatlinks/monitor-txt](https://github.com/MisterChatlinks/monitor-txt)

> Development happens on the `dev` branch – feel free to open PRs or start discussions.

