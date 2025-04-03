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

export default () =>
    <div $click={myFunc}>
        {arbitraryReactiveFunction($.foo) + 'h' + $.foo}
    </div>
