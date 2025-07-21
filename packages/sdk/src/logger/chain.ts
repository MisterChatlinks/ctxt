
import { LogInstance } from "@structs/log";
import { SynchronousPromiseChain } from "@utils/chaining/main";

export class ChainableLogInterface extends SynchronousPromiseChain<ReturnType<InstanceType<typeof LogInstance>["toObject"]>> {

    constructor({ log, onSubmit }: {
        log: InstanceType<typeof LogInstance>,
        onSubmit: (p: ReturnType<InstanceType<typeof LogInstance>["toObject"]>) => unknown
    }) {
        super(onSubmit);
        this.ref.param = log.toObject();

        return this.initJobs(["context", "config"]);
    }

    public context(data: any) {
        this.ref.param.context = data;
        delete (this as any).context;
        return this.createProxy();
    }

    public config(data: any) {
        this.ref.param.config = data;
        delete (this as any).config; 
    }
}