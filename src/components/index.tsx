import {defineComponent, refs} from "~/framework/reactivity.ts";

const $ = refs({
    foo: 5,
})

function myFunc() {
    $.foo++;
}

export default defineComponent(
    <>
        <div $click={myFunc}>{$.$foo}</div>
        <div>hi</div>
    </>
)