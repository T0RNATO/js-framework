declare namespace JSX {
    type Element = HTMLElement;

    interface IntrinsicElements {
        [elemName: string]: {
            [K in keyof HTMLElementEventMap as `$${K}`]?: (event: HTMLElementEventMap[K]) => void;
        } & {
            [prop: string]: any;
        } & {
            children?: HTMLElement | HTMLElement[] | string | (() => string);
        }
    }
}