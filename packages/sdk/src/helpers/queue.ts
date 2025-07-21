import { LogInstance } from "@structs/log";

/**
 * Represents a queue for managing log entries of type `LogInstance`.
 */
export class MoniTextQueue {

    private logQueue: InstanceType<typeof LogInstance>[] = [];

    private isLogInstance(val: unknown, context: string): asserts val is InstanceType<typeof LogInstance> {
        if (!(val instanceof LogInstance)) {
            throw new Error(`[MoniTextQueue] ${context} must be instance of LogInstance`);
        }
    }

    public addInQueue(log: InstanceType<typeof LogInstance>): void {
        this.isLogInstance(log, "log");
        this.logQueue.push(log);
    }

    public getInQueue(id: symbol): InstanceType<typeof LogInstance> | undefined {
        if (typeof id !== "symbol") {
            throw new Error(`[MoniTextQueue] id must be a symbol`);
        }

        return this.logQueue.find(log => log.toObject().identifyer === id);
    }

    public deleteInQueue(id: symbol): void {
        if (typeof id !== "symbol") {
            throw new Error(`[MoniTextQueue] id must be a symbol`);
        }

        this.logQueue = this.logQueue.filter(
            log => log.toObject().identifyer !== id
        );
    }

    public mergeInQueue(log: InstanceType<typeof LogInstance>): void {
        this.isLogInstance(log, "log");
        const incoming = log.toObject();

        this.logQueue = this.logQueue.map(existing => {
            const existingObj = existing.toObject();
            return existingObj.identifyer === incoming.identifyer
                ? new LogInstance({ ...existingObj, ...incoming }) // full merge into a new struct
                : existing;
        });
    }

    public flushReady(callback: (log: InstanceType<typeof LogInstance>) => void): void {
        this.logQueue = this.logQueue.filter(log => {
            if (log.toObject().ready) {
                callback(log);
                return false;
            }
            return true;
        });
    }

    public flushReadyWhere(
        predicate: (log: InstanceType<typeof LogInstance>) => boolean,
        callback: (log: InstanceType<typeof LogInstance>) => void
    ): void {
        this.logQueue = this.logQueue.filter(log => {
            const obj = log.toObject();
            if (predicate(log) && obj.ready) {
                callback(log);
                return false;
            }
            return true;
        });
    }

    public has(id: symbol): boolean {
        return this.logQueue.some(log => log.toObject().identifyer === id);
    }

    public size(): number {
        return this.logQueue.length;
    }

    public list(): InstanceType<typeof LogInstance>[] {
        return [...this.logQueue];
    }
}
