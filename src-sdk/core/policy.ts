import { BusEvent, BusConfig } from "./types/event";
import { PolicyDescriptor } from "./types/policy";

export class MoniTextPolicy {
  public readonly descriptor: PolicyDescriptor;

  constructor(descriptor: PolicyDescriptor) {
    if (!descriptor.name) {
      throw new Error(`[MoniTextPolicy] Every policy must have a name`);
    }

    this.descriptor = {
      phase: "core",
      priority: 0,
      ...descriptor,
    };
  }

  get name() {
    return this.descriptor.name;
  }

  get phase() {
    return this.descriptor.phase!;
  }

  apply(log: any, config: any, next: () => void) {
    this.descriptor.handle(log, config, next);
  }

  matches(log: any) {
    const { level, filter } = this.descriptor;
    return (!level || level.includes(log.level)) && (!filter || filter(log));
  }
}

export function applyPolicies(
  policies: MoniTextPolicy[],
  log: BusEvent,
  config: typeof BusConfig,
  phase: "pre" | "core" | "post" = "core"
) {
  return new Promise((resolve) => {
    const pipeline = policies
      .filter((p) => p.phase === phase && p.matches(log))
      .sort((a, b) => a.descriptor.priority! - b.descriptor.priority!);

    let i = 0;

    const next = () => {
      const policy = pipeline[i++];
      if (policy) {
        policy.apply(log, config, next);
      } else {
        resolve(true)
      }
    };
    next();
  })

}
