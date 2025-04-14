export function err(msg: string): Error {
    return new Error("Framework Error: " + msg);
}

export function log<A extends any>(a: A): A {
    console.log(a);
    return a;
}