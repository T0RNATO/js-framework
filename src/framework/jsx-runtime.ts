import {$Computed, Refs} from "~/framework/reactivity.ts";

type Props = JSX.IntrinsicElements[string];

// The function that the JSX is compiled into using, by Vite
export function jsx(tag: string | ((props: Refs) => HTMLElement), props: Props): HTMLElement {
    let el: HTMLElement;
    if (typeof tag === "string") {
        el = document.createElement(tag);
    } else {
        el = tag(new Refs(props, true));
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
            registerComputedDependencies(value, () => {
                el.setAttribute(prop, value.func());
            })
        }
        // An event listener
        else if (prop.startsWith("$")) {
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
        registerComputedDependencies(child, () => {
            text.data = child.func();
        })
    } else {
        parent.appendChild(document.createTextNode(child));
    }
}

function registerComputedDependencies(c: $Computed, update: () => any, runOnce = true) {
    // Loop through the dependencies of the computed value, and add a listener to each one so it's refreshed when one changes.
    for (const [dep, refs] of Object.entries(c.dependencies)) {
        refs.addListener(dep, update);
    }

    if (runOnce) {
        update();
    }
}

export const Fragment = "div";