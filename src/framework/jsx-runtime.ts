import {$Computed} from "~/framework/reactivity.ts";

export function jsx(tag: string, props: JSX.IntrinsicElements[string]): HTMLElement {
    const el = document.createElement(tag);

    for (const [prop, value] of Object.entries(props)) {
        if (prop === "children") {
            if (value instanceof HTMLElement) {
                el.appendChild(value);
            } else if (value?.length && value?.[0] instanceof HTMLElement) {
                for (const child of value) {
                    el.appendChild(child);
                }
            } else if (value instanceof $Computed) {
                const l = value.$.listeners;

                function update() {
                    el.innerText = value.func();
                }

                for (const watcher of value.watchers) {
                    const prop = watcher.slice(2);
                    if (!(prop in l)) {
                        l[prop] = [];
                    }
                    l[prop].push(update);
                }

                update();
            } else {
                el.innerText = value;
            }
            continue;
        }
        if (!prop.startsWith("$")) {
            el.setAttribute(prop, value as string);
        } else {
            el.addEventListener(prop.slice(1), value);
        }
    }
    return el;
}

export const Fragment = "div";