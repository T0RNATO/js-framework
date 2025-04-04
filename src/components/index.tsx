import {refs} from "~/framework/reactivity.ts";

const $ = refs({
    foo: 5,
    bar: "awd"
})

function myFunc() {
    $.foo++;
}

function arbitraryReactiveFunction(value: number) {
    return `hello, ${value}`
}

export default () => <>
    <input placeholder={arbitraryReactiveFunction($.foo)}/>
    <button $click={myFunc}>Content: {$.foo}</button>
</>
