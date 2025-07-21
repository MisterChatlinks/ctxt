import { deepClone } from "../utils/object/main";
import { resolveType } from "../utils/types/main";

export abstract class Struct<T extends object> {

    #raw: T

    public _struct: T

    constructor(raw: Partial<T> = {}) {
        this.#raw = raw as T
        this._struct = Object.assign({}, raw) as T;
        typeof this?.validate === "function" && this.validate();
    }

    /**
     * Subclasses must implement validation logic.
     */
    abstract validate(): void;

    /**
     * Get deep copy of plain object version of this struct.
     */
    toObject(): T {
        return deepClone(this._struct);
    }

    /**
     * Clone the struct with overrides.
     */
    clone(overrides: Partial<T> = {}): this {
        return new (this.constructor as any)({ ...this.toObject(), ...overrides });
    }

    /**
     * Patch the current instance in-place.
     */
    patch(overrides: Partial<T> = {}): this {
        Object.assign(this._struct, overrides);
        typeof this?.validate === "function" && this.validate();
        return this;
    }

    describe(): Record<string, any> {
        const output: Record<string, any> = {};

        const raw_type = this.#raw

        for (const key of Object.keys(this.#raw)) {
            const val = this.#raw[key as keyof typeof raw_type];
            const type = resolveType(val);

            if (type === "object" && val && typeof val === "object" && !Array.isArray(val)) {
                output[key] = {
                    type: "object",
                    required: true,
                    properties: Object.fromEntries(
                        Object.entries(val).map(([k, v]) => [
                            k,
                            {
                                type: resolveType(v),
                                default: v,
                                required: (v != null && v != undefined) ? true : false,
                            },
                        ])
                    ),
                };
            } else {
                output[key] = {
                    type,
                    default: val,
                    required: true,
                };
            }
        }

        return output;
    }

    pick<K extends keyof T>(...keys: K[]): Pick<T, K> {
        const full = this.toObject();
        const selected = {} as Pick<T, K>;

        for (const key of keys) {
            selected[key] = full[key];
        }

        return selected;
    }

    omit<K extends keyof T>(...keys: K[]): Omit<T, K> {
        const full = this.toObject();
        const result = { ...full };

        for (const key of keys) {
            delete result[key];
        }

        return result;
    }

    pickStruct<K extends keyof T>(...keys: K[]): Struct<Pick<T, K>> {
        const self = this;
        const picked = this.pick(...keys);
          return new (class extends Struct<typeof picked>{
            validate = self?.validate?.bind(this)
          })(picked)
    }
}


export function createStructFromShape<S extends object>(
    shape: S,
    validateFn?: (this: S & Struct<S>) => void,
) {
    type T = typeof shape;


    class NewStruct extends Struct<T> {

        constructor(raw?: Partial<T>) {
            super({ ...shape, ...raw });
        }

        validate() {
            if (validateFn) validateFn.call(this._struct as any);
        }
    }

    return NewStruct;
}