export function err(msg: string): Error {
    return new Error("Framework Error: " + msg);
}