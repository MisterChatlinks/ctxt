import { MoniTextEventBus } from "../core/event";
import { createStructFromShape } from "../core/struct";
import { BusConfig } from "../core/types/event";

/**
 * Decribe how a policy should look like, policy are meant to be intalled on an event bus
*/
const Policy = {
    install: undefined as unknown as (bus: MoniTextEventBus, config: typeof BusConfig) => void,
};

export const PolicyInstance = createStructFromShape(Policy);

