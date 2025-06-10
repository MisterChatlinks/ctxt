# 🖥️ Monitor-TXT 

## 🚀 Concept

**`mtxt | monitext`**, short for **Monitor-TXT**, is a developer-friendly logging utility built for **real-time log monitoring**. It provides structured, configurable, and encrypted logging for large-scale projects and advanced monitoring needs.

Its primary mission is to **eliminate silent failures** in web or backend applications by **forwarding your logs to our API**, where you can monitor them live.

---

## 📦 Installation

> **Note:** `Monitor-TXT` is currently in **beta**.

Install the package via npm:

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

### Compact Logging (`mtxt`)
`mtxt` is the **compact, inline** version — ideal for quick calls.

```ts
mtxt.info("Your message here", { yourMetaData: someInfo() }, { silent: false });
```

### Verbose Logging (`monitext`)
`monitext` is the **explicit, verbose** version — ideal for clarity and log hygiene.

```ts
monitext
  .error("First error line", "Another line", "More info if needed")
  .withMeta({ yourMetaData })
  .config({ silent: true }) // Silences console output
  .send();
```

---

## ⚙️ Configuration: `monitext.runtime.ts`

Once the runtime file is generated, you’ll find:

```ts
export const { mtxt, monitext } = defineMonitextRuntime({
  project_name: "<YOUR_PROJECT_NAME>",
  env: "node", // or "web"
  devMode: false,
  apiKey: "<YOUR_API_KEY>",
  format: "dev", // Options: "dev", "json", "compact"
  silent: [], // Silence specific log levels globally
  transportationDelay: 1000, // Delay in ms for batching logs
  backOffDelay: 500, // Initial backoff delay in ms for retries
  fallbackFilePath: "./error-logs.txt", // File path for fallback storage
  fallback: (logs) => {
    console.error("Custom fallback handler:", logs);
  },
});
```

### Key Configuration Options:
- **`project_name`**: Name of your project.
- **`env`**: Environment where the library is running (`node`, `web`, or `deno`).
- **`devMode`**: If `true`, logs are kept local for debugging. If `false`, logs are forwarded to the API.
- **`apiKey`**: Your API key for authentication.
- **`format`**: Logging format (`dev`, `json`, or `compact`).
- **`silent`**: Array of log levels to silence globally (e.g., `["info", "success"]`).
- **`transportationDelay`**: Delay in milliseconds for batching logs before sending them.
- **`backOffDelay`**: Initial delay in milliseconds for exponential backoff during retries.
- **`fallbackFilePath`**: File path for storing logs locally in case of API failure (Node.js/Deno only).
- **`fallback`**: Custom fallback function to handle logs when the API is unreachable.

---

## 🔍 How It Works

### Logging Levels
The library supports the following log levels:
- **`info`**: General information.
- **`success`**: Successful operations.
- **`warn`**: Warnings that require attention.
- **`error`**: Errors that need debugging.
- **`fatal`**: Critical errors that may crash the application.

### Features
- **Async Logging**: Logs are batched and sent in the background.
- **Retry Logic**: Logs are retried with exponential backoff if the API is unreachable.
- **Fallback Mechanisms**: Logs are stored locally (Node.js/Deno) or in browser storage (LocalStorage/IndexedDB) if retries fail.
- **End-to-End Encryption**: Logs are encrypted using OpenPGP before being sent to the API.
- **Custom Runtime**: Running `monitext` sets up a runtime file tailored to your project.
- **Preconfigured Instances**: Importing from `#monitext-runtime` gives you ready-to-use logging interfaces.

---

## 🧠 Why Use It?

- **Prevent Silent Failures**: Ensure all critical logs are captured and monitored.
- **Real-Time Visibility**: Monitor logs live via the API.
- **Structured Logging**: Use metadata and configurations to enrich logs.
- **Flexible Formats**: Choose between human-readable (`dev`), structured (`json`), or compact (`compact`) formats.
- **Advanced Monitoring**: Configure silent modes, thresholds, and alert options.

---

## 🛡️ Security

- Logs are encrypted using OpenPGP before being sent to the API.
- Transport is handled over HTTPS with authentication via API keys.

---

## 📖 Advanced Features

### Preconfigured Loggers
You can define preconfigured loggers for specific use cases:

#### Verbose Logger
```ts
const verboseLogger = monitext.defLogguer("VerboseLogger", { silent: true });
verboseLogger.info("This won't log due to silent mode").send();
verboseLogger.error("Critical error").config({ silent: false }).send();
```

#### Compact Logger
```ts
const compactLogger = mtxt.defLogguer("CompactLogger", { silent: true });
compactLogger.info("This won't log due to silent mode");
compactLogger.success("Operation successful", { conf: { silent: false } });
```

### Silent Mode
- Silence logs globally by level:
```ts
defineMonitextRuntime({
  silent: ["info", "success"]
});
```
- Silence individual logs:
```ts
mtxt.error("This won't log", { conf: { silent: true } });
monitext.warn("This won't log").config({ silent: true }).send();
```

---

## 🧪 Testing

Unit tests are included to validate the functionality of the library. Run tests using:
```bash
npm run test
```

### Key Test Cases:
1. **API Transport**:
   - Verifies that logs are sent to the API with the correct payload and headers.
2. **Retry Logic**:
   - Ensures logs are retried with exponential backoff when the API is unreachable.
3. **Fallback Mechanism**:
   - Tests that logs are handled by the fallback function or stored locally when retries fail.
4. **Batching**:
   - Confirms that logs are batched and sent together for efficiency.

---

## 💬 Final Notes

Thanks for checking out **Monitor-TXT**!

📢 **Contribute, raise issues, or follow development at:**

👉 [https://github.com/MisterChatlinks/monitor-txt](https://github.com/MisterChatlinks/monitor-txt)

> Development happens on the `dev` branch – feel free to open PRs or start discussions.

