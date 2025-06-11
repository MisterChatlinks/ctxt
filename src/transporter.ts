import { scheduleEntrie as Log, MTConf } from '../src-types/monitext.types';

const MAX_RETRIES = 5;

/**
 * The `MoniTextTransporter` class is responsible for managing and transporting logs
 * to an API endpoint or a fallback mechanism in case of failures. It supports
 * multiple environments, including Node.js, Deno, and browser environments.
 * 
 * ### Features:
 * - **API Transport**: Sends logs to an API endpoint with retry logic and exponential backoff.
 * - **Fallback Mechanisms**: Handles log storage locally (Node.js/Deno) or in browser storage.
 * - **User-Defined Fallback**: Allows custom fallback handlers for log processing.
 * - **Environment Adaptation**: Dynamically adapts to the runtime environment (Node.js, Deno, or browser).
 * - **Batching**: Groups logs into batches for efficient transportation.
 * 
 * ### Usage:
 * 1. Configure the transporter using `defConfig`.
 * 2. Use `scheduleTransportation` to queue logs for sending.
 * 3. Logs are sent automatically after a delay or when `sendLogs` is called.
 * 
 * ### Static Methods:
 * - `defConfig(conf: MTConf)`: Defines the configuration for the transporter, including fallback options.
 * - `scheduleTransportation(log: Log)`: Queues logs for batch transportation.
 * - `sendLogs(logs: Log[])`: Sends logs to the API with retry logic and fallback handling.
 * 
 * ### Private Methods:
 * - `sendToAPI(logs: Log[])`: Handles the actual API transport logic.
 * - `getBackoffDelay()`: Calculates the delay for exponential backoff during retries.
 * - `handleFallback(logs: Log[])`: Handles fallback logic for storing logs locally or in browser storage.
 * - `writeToLocalFile(logs: Log[], filePath: string)`: Writes logs to a local file in Node.js.
 * - `writeToLocalFileWithDeno(logs: Log[], filePath: string)`: Writes logs to a local file in Deno.
 * - `writeToBrowserStorage(logs: Log[])`: Stores logs in browser storage (LocalStorage or IndexedDB).
 * 
 * ### Environment Detection:
 * - `isNodeEnvironment()`: Determines if the runtime environment is Node.js.
 * 
 * ### Configuration:
 * - `MTConf`: Configuration object that includes options like fallback file path, API key, and user-defined fallback handler.
 * 
 * ### Example:
 * ```typescript
 * MoniTextTransporter.defConfig({
 *   apiKey: '<YOUR_API_KEY>',
 *   fallbackFilePath: './error-logs.txt',
 *   fallback: (logs) => {
 *     console.error('Custom fallback handler:', logs);
 *   },
 * });
 * 
 * MoniTextTransporter.scheduleTransportation({
 *   message: 'Error occurred',
 *   level: 'error',
 * });
 * ```
 */
export class MoniTextTransporter {
    /**
     * Static variable to hold the log queue for retrying failed log sends.
     * @type {Log[]}
     */
    private static logQueue: Log[] = [];

    /**
     * Static variable to keep track of the number of retries.
     * @type {number}
     */
    private static retryCount = 0;

    /**
     * Static variable to store the user-defined fallback function.
     * @type {((logs: Log[]) => void | unknown) | null}
     */
    private static userDefinedFallback: ((logs: Log[]) => void | unknown) | null = null;

    /**
     * Configuration object for the transporter.
     * @type {MTConf}
     */
    private static config: MTConf;

    /**
     * Defines the configuration for the transporter.
     * @param {MTConf} conf - The configuration object.
     */
    public static defConfig(conf: MTConf) {
        this.config = conf;
        if (conf?.fallback && typeof conf?.fallback === 'function') {
            this.userDefinedFallback = conf.fallback;
        }
    }

    /**
     * Checks if the current environment is Node.js.
     * @returns {boolean} True if running in Node.js, false otherwise.
     */
    private static isNodeEnvironment(): boolean {
        return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
    }

    /**
     * Static variable to hold the current batch of logs.
     * @type {Log[]}
     */
    private static batch: Log[] = [];

    /**
     * Static variable to store the timeout for the next transportation schedule.
     * @type {NodeJS.Timeout | null}
     */
    private static nextTansportationSchedule: null | NodeJS.Timeout;

    /**
     * Queues a log for batch transportation and schedules the transportation process.
     * @param {Log} log - The log to be queued.
     */
    public static async scheduleTransportation(log: Log) {
        this.batch.push(log);

        if (this.nextTansportationSchedule != null) {
            clearInterval(this.nextTansportationSchedule as NodeJS.Timeout);
        }

        const debounce = this.config?.transportationDelay || 60000; // Default to 60 seconds if not specified
        this.nextTansportationSchedule = setTimeout(() => {
            if (this.batch.length === 0) {
                console.warn(`${this.name} No logs to send.`);
                return;
            }
            const logsToSend = [...this.batch]; // Copy the batch to avoid mutation during sending
            this.batch = []; // Clear the batch for the next round
            this.sendLogs(logsToSend);
            this.nextTansportationSchedule = null;

        }, debounce); // Default to 60 seconds if not specified
    }

    /**
     * Sends logs to the API endpoint with retry logic and fallback handling.
     * @param {Log[]} logs - The logs to be sent.
     */
    public static async sendLogs(logs: Log[]) {
        try {
            await this.sendToAPI(logs);
            this.retryCount = 0; // Reset retry count on success
        } catch (error) {
            this.logQueue.push(...logs); // Queue logs for retry
            this.retryCount++;
            if (this.retryCount <= MAX_RETRIES) {
                setTimeout(() => this.sendLogs(this.logQueue), this.getBackoffDelay());
            } else {
                if (this.config?.useDefaultFallback === true || this.config.useDefaultFallback === undefined) {
                    this.handleFallback(this.logQueue);
                }
                if (this.userDefinedFallback) {
                    this.userDefinedFallback(logs);
                }
            }
        }
    }

    /**
     * Calculates the delay for exponential backoff during retries.
     * @returns {number} The delay in milliseconds.
     */
    private static getBackoffDelay(): number {
        return Math.pow(2, this.retryCount) * (this.config?.backOffDelay || 1000); // Exponential backoff
    }

    private static async sendToAPI(logs: Log[]) {
        const apiUrl = this.config?.apiUrl; // Replace with your API endpoint
        const apiKey = this.config?.apiKey;

        if (!apiUrl || !apiKey) {
            throw new Error('API URL or API Key is not defined in the configuration.');
        }

        try {
            // Encrypt the payload if encryption is enabled
            const payload = JSON.stringify(logs);
            const encryptedPayload = this.config?.encryptPayload
                ? await this.config.encryptPayload(payload, apiKey)
                : payload;

            let response: Response;

            if (typeof encryptedPayload === 'object' && 'payload' in encryptedPayload) {
                const { apiKey, payload } = encryptedPayload;

                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body:  typeof payload  === "object" ? JSON.stringify(payload) : payload,
                });
            } 
            else {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: payload,
                });
            }

            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}: ${response.statusText}`);
            }

            console.log(`[${this.name}] Logs successfully sent to API.`);
        } 
        catch (error) {
            console.error(`[${this.name}] Failed to send logs to API: ${(error as Error).message}`);
            throw error; // Re-throw the error to trigger retry logic
        }
    }

    /**
     * Handles fallback logic for storing logs locally or in browser storage.
     * @param {Log[]} logs - The logs to be handled in fallback.
     */
    private static handleFallback(logs: Log[]) {
        if (this.isNodeEnvironment()) {
            const filePath = this.config?.fallbackFilePath || '.mtxt-err';
            //@ts-ignore Deno global is not defined in Node.js
            if (typeof Deno !== 'undefined') {
                this.writeToLocalFileWithDeno(logs, filePath);
            } else {
                this.writeToLocalFile(logs, filePath);
            }
        } else {
            this.writeToBrowserStorage(logs);
        }
    }

    /**
     * Writes logs to a local file in Node.js.
     * @param {Log[]} logs - The logs to be written.
     * @param {string} [filePath='.mtxt-err'] - The path to the file where logs will be written.
     */
    private static async writeToLocalFile(logs: Log[], filePath: string = '.mtxt-err') {
        const fs = await import('node:fs/promises');
        try {
            await fs.appendFile(filePath, logs.join('\n') + '\n', 'utf-8');
            console.log(`[${this.name}] Logs written to ${filePath}`);
        } catch (error) {
            console.error(`${this.name} Failed to write logs to file: ${(error as Error).message}`);
        }
    }

    /**
     * Writes logs to a local file in Deno.
     * @param {Log[]} logs - The logs to be written.
     * @param {string} [filePath='.mtxt-err'] - The path to the file where logs will be written.
     */
    private static async writeToLocalFileWithDeno(logs: Log[], filePath: string = '.mtxt-err') {
        try {
            //@ts-ignore Deno global is not defined in Node.js
            if (typeof Deno !== 'undefined' && Deno.writeTextFile) {
                //@ts-ignore Deno global is not defined in Node.js
                await Deno.writeTextFile(filePath, logs.join('\n') + '\n', { append: true });
            } else {
                throw new Error('Deno environment is not available.');
            }
            console.log(`[${this.name}] Logs written to ${filePath}`);
        } catch (error) {
            console.error(`${this.name} Failed to write logs to file: ${(error as Error).message}`);
        }
    }

    /**
     * Stores logs in browser storage (LocalStorage or IndexedDB).
     * @param {Log[]} logs - The logs to be stored.
     */
    private static writeToBrowserStorage(logs: Log[]) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('mtxt-logs', JSON.stringify(logs));
        } else if (typeof indexedDB !== 'undefined') {
            const request = indexedDB.open('MoniTextLogs', 1);
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('logs')) {
                    db.createObjectStore('logs', { keyPath: 'id' });
                }
            };
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction('logs', 'readwrite');
                const store = transaction.objectStore('logs');
                logs.forEach(log => store.add(log));
            };
            request.onerror = (event) => {
                console.error('IndexedDB error:', (event.target as IDBRequest).error);
            };
        }
    }
}

