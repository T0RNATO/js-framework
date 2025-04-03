class Refs {
    public listeners: Record<string, ((newValue: any) => void)[]> = {};
    constructor(values: Record<string, any>) {
        return new Proxy(this, {
            get(obj: Refs, prop, receiver) {
                if (prop in obj) { // @ts-ignore
                    return obj[prop];
                }

                return Reflect.get(values, prop, receiver);
            },
            set(obj: Refs, prop: string | symbol, value: any, receiver:any): boolean {
                // noinspection SuspiciousTypeOfGuard
                if (typeof prop === "symbol") {
                    return Reflect.set(values, prop, value, receiver);
                }
                values[prop] = value;
                for (const listener of obj.listeners[prop]) {
                    listener(value);
                }
                return true;
            }
        });
    }
}

export function refs<T extends Record<string, any>>(values: T) {
    return new Refs(values) as unknown as T & Refs;
}

export function render(parent: HTMLElement, el: HTMLElement) {
    parent.appendChild(el);
}

export class $Computed {
    constructor(public func: () => any, public $: Refs, public watchers: string[]) {
    }
}

export function $r<T extends () => any>($: Refs, func: T): $Computed {
    const watchers = String(func).match(/\$\.(\w+)/g) || [];
    return new $Computed(func, $, watchers);
}