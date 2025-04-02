export function jsx(tag: string, props: JSX.IntrinsicElements[string]): HTMLElement {
    const el = document.createElement(tag);

    for (const [prop, value] of Object.entries(props)) {
        if (prop === "children") {
            if (value?.$) {
                const ref = value as Reactive;
                ref.$.push((newValue) => {
                    el.innerText = newValue;
                })
                el.innerText = ref.value;
            } else if (value instanceof HTMLElement) {
                el.appendChild(value);
            } else if (value?.length && value?.[0] instanceof HTMLElement) {
                for (const child of value) {
                    el.appendChild(child);
                }
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

type Reactive = {
    $: ((newValue: any) => void)[],
    value: any,
}

export const Fragment = "div";