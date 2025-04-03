declare namespace JSX {
    type Element = HTMLElement;

    interface IntrinsicElements {
        [elemName: string]: {
            [K in `$${keyof HTMLElementEventMap}`]?: (event: HTMLElementEventMap[K extends `$${infer E}` ? E : never]) => void;
        } & {
            [prop: string]: any;
        } & {
            children?: HTMLElement | HTMLElement[] | string | (() => string);
        }
    }
}