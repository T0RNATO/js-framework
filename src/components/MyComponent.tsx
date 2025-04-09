import {refs} from "~/framework/reactivity.ts";

const $ = refs({
    baz: 12
})

export default (props: {foo: number, bar: number})=> {
    return <div $click={() => $.baz++}>{props.foo},{props.bar},{$.baz}</div>
}