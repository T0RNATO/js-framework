import {err} from "~/framework/utils.ts";

export class Refs {
    private listeners: Record<string, ((newValue: any) => void)[]> = {};
    constructor(private values: Record<string, any>, private frozen = false) {
        for (const [prop, value] of Object.entries(values)) {
            this.listeners[prop] = [];
            if (typeof value === "object") {
                values[prop] = new Refs(value);
            }
        }
        return new Proxy(this, {
            get(self: Refs, prop, receiver) {
                if (prop in self) { // @ts-ignore
                    return self[prop];
                }

                const value = Reflect.get(values, prop, receiver);

                if (value instanceof $Computed) {
                    return value.func();
                } else {
                    return value;
                }
            },
            set(self: Refs, prop: string | symbol, value: any, receiver:any): boolean {
                if (self.frozen) {
                    throw err("Do not attempt to modify passed props")
                }
                // noinspection SuspiciousTypeOfGuard
                if (typeof prop === "symbol") {
                    return Reflect.set(values, prop, value, receiver);
                }
                values[prop] = value;
                for (const listener of self.listeners[prop]) {
                    listener(value);
                }
                return true;
            }
        });
    }
    addListener(prop: string, func: () => any) {
        const value = this.values[prop];
        if (value instanceof $Computed) {
            value.dependencies[prop].addListener(prop, func);
        } else {
            this.listeners[prop].push(func);
        }
    }
}

export function refs<T extends Record<string, any>>(values: T) {
    return new Refs(values) as unknown as T & Refs;
}

export function render(parent: HTMLElement, el: HTMLElement) {
    parent.appendChild(el);
}

export class $Computed {
    constructor(public func: () => any, public dependencies: Record<string, Refs>) {}
}