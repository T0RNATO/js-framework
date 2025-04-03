import {refs} from "~/framework/reactivity.ts";

const $ = refs({
    foo: 5,
})

function myFunc() {
    $.foo++;
}

export default () =>
    <div $click={myFunc}>
        {'h' + $.$foo}
    </div>