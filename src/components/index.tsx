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

function func(obj: {awd: {awd: number}}) {
    return obj.awd.awd;
}

export default () => <>
    <input placeholder={arbitraryReactiveFunction($.foo)}/>
    <button $click={myFunc}>
        Content: {func({
            awd: {
                awd: $.foo
            }
        })}
        Awd: {$.bar}
    </button>
</>
