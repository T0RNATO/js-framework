import {$Computed} from "~/framework/reactivity.ts";

export function jsx(tag: string, props: JSX.IntrinsicElements[string]): HTMLElement {
    const el = document.createElement(tag);

    for (const [prop, value] of Object.entries(props)) {
        if (prop === "children") {
            if (Array.isArray(value)) {
                for (const child of value) {
                    addChild(el, child);
                }
            } else {
                addChild(el, value);
            }
            continue;
        }
        if (value instanceof $Computed) {
            processComputed(value, () => {
                el.setAttribute(prop, value.func());
            })
        } else if (prop.startsWith("$")) {
            el.addEventListener(prop.slice(1), value);
        } else {
            el.setAttribute(prop, value as string);
        }
    }
    return el;
}

function addChild(parent: HTMLElement, child: any) {
    if (child instanceof HTMLElement) {
        parent.appendChild(child);
    } else if (child instanceof $Computed) {
        processComputed(child, () => {
            parent.innerText = child.func();
        })
    } else {
        parent.innerText = child;
    }
}

function processComputed(c: $Computed, update: () => any) {
    for (const watcher of c.watchers) {
        const prop = watcher.slice(2);
        if (!(prop in c.$.listeners)) {
            c.$.listeners[prop] = [];
        }
        c.$.listeners[prop].push(update);
    }

    update();
}

export const Fragment = "div";