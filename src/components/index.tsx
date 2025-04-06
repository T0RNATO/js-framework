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

function func(obj: {awd: number}) {
    return obj.awd;
}

export default () => <>
    <input placeholder={arbitraryReactiveFunction($.foo)}/>
    <button $click={myFunc}>
        Content: {func({
            awd: 12
        })}
        Awd: {$.bar}
    </button>
</>
