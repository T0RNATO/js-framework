class Refs {
    public listeners: Record<string, ((newValue: any) => void)[]> = {};
    constructor(values: Record<string, any>) {
        return new Proxy(this, {
            get(obj: Refs, prop, receiver) {
                if (prop in obj) { // @ts-ignore
                    return obj[prop];
                }
                // noinspection SuspiciousTypeOfGuard
                if (typeof prop === "symbol") {
                    return Reflect.get(values, prop, receiver);
                }
                if (!prop.startsWith("$")) {
                    return values[prop];
                } else {
                    prop = prop.slice(1);
                    if (!(prop in obj.listeners)) {
                        obj.listeners[prop] = [];
                    }
                    return {
                        $: obj.listeners[prop],
                        value: values[prop]
                    }
                }
            },
            set(obj: Refs, prop: string | symbol, value: any, receiver:any): boolean {
                // noinspection SuspiciousTypeOfGuard
                if (typeof prop === "symbol") {
                    return Reflect.set(values, prop, value, receiver);
                }
                for (const listener of obj.listeners[prop]) {
                    listener(value);
                }
                values[prop] = value;
                return true;
            }
        });
    }
}

export function refs<T extends Record<string, any>>(values: T) {
    return new Refs(values) as unknown as T & {
        // @ts-ignore; ignore this horrendous batshit function
        [K in `$${keyof T}`]: T[K extends `$${infer E}` ? E : never]
    } & Refs;
}

class Component {
    constructor(public el: HTMLElement) {}

    render(parent: HTMLElement) {
        parent.appendChild(this.el);
    }
}

export function defineComponent(element: HTMLElement): Component {
    return new Component(element);
}