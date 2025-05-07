# 🖥️ Monitor-TXT (`mtxt`)

## 🚀 Concept

**`mtxt`**, short for **`monitor-txt`**, is a lightweight logging utility designed for **live log monitoring**. Its main goal is to **prevent silent failures** often encountered in web or backend apps, by **redirecting your logs to our API**, where you can view them in real time.

---

## 📦 Installation

> **Note:** The package is currently in **beta**.

```bash
npm install monitor-txt@beta
```

After installation, you must initialize the monitor:

```bash
mtxt init
```

To keep your configuration in sync (especially if you edit it manually), start the watcher:

```bash
mtxt -watch
```

---

## 🛠️ Usage

Compatible with both **ESM** and **CommonJS**:

```ts
// ESM
import mtxt from "monitor-txt";
```

```js
// CommonJS
const mtxt = require("monitor-txt").default;
```

Then simply use:

```ts
mtxt.log({ send: "Your message here" });
```

---

## ⚙️ Configuration: `mtxt-config.ts`

After running `mtxt init`, a config file is created at the root of your project:

```ts
const config = {
  project_name: "<YOUR_PROJECT_NAME>",
  env: "node", // or 'web' in future updates
  handleException: true,
  handleRejection: true,
  include: ["src/*"], // Only applies to Node/runtime environments
  devMode: true,      // Set to false in production
  apiKey: "<YOUR_API_KEY>"
};

export default config;
```

> **Note:** When `devMode` is true, logs stay local. Set it to `false` to start forwarding them to the API.

---

## 🔍 How It Works

* All methods on the `mtxt` object are **asynchronous**, ensuring they don’t block or interfere with your app’s flow.
* `mtxt init` creates a base config at your project root.
* `mtxt -watch` watches for changes to your config and **rebuilds** the logger accordingly.
* When you `import mtxt from "monitor-txt"`, you're importing a **custom-built instance** configured with your local project settings.

---

## 💬 Final Notes

Thanks for checking out **Monitor-TXT**.

You can contribute to the project or report issues at:
👉 [https://github.com/MisterChatlinks/monitor-txt](https://github.com/MisterChatlinks/monitor-txt)
→ Look for the `dev` branch for active development.