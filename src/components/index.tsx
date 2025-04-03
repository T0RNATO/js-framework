import {refs} from "~/framework/reactivity.ts";

const $ = refs({
    foo: 5,
})

function myFunc() {
    $.foo++;
}

function arbitraryReactiveFunction(value: number) {
    return `hello, ${value}`
}

export default () => <>
    <input placeholder={arbitraryReactiveFunction($.foo)}/>
    <button $click={myFunc}>strings{$.foo}</button>
</>
