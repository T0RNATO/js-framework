import {$Computed, Refs} from "~/framework/reactivity.ts";

type Props = JSX.IntrinsicElements[string];

export function jsx(tag: string | ((props: Refs) => HTMLElement), props: Props): HTMLElement {
    let el: HTMLElement;
    if (typeof tag === "string") {
        el = document.createElement(tag);
    } else {
        const unwrappedProps = {...props};
        for (const [prop, value] of Object.entries(props)) {
            if (value instanceof $Computed) {
                unwrappedProps[prop] = value.func();
                // in an ideal world we don't rerender the entire component, rather changing the attribute like we do below
                processComputed(value, () => {
                    const newEl = tag(new Refs(unwrapProps(props), true));
                    el.replaceWith(newEl);
                    el = newEl;
                }, false)
            }
        }
        el = tag(new Refs(unwrappedProps, true));
    }

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
        const text = document.createTextNode("");
        parent.appendChild(text);
        processComputed(child, () => {
            text.data = child.func();
        })
    } else {
        parent.appendChild(document.createTextNode(child));
    }
}

function processComputed(c: $Computed, update: () => any, runOnce = true) {
    for (const watcher of c.watchers) {
        const prop = watcher.slice(2);
        if (!(prop in c.$.listeners)) {
            c.$.listeners[prop] = [];
        }
        c.$.listeners[prop].push(update);
    }

    if (runOnce) {
        update();
    }
}

function unwrapProps(props: Props): Props {
    const unwrappedProps = {...props};

    for (const [prop, value] of Object.entries(props)) {
        if (value instanceof $Computed) {
            unwrappedProps[prop] = value.func();
        }
    }

    return unwrappedProps;
}

export const Fragment = "div";