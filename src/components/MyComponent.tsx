import {refs} from "~/framework/reactivity.ts";

const $ = refs({
    baz: 12
})

export default (props: {foo: number, bar: number})=> {
    // console.log("component rerendered")
    return <div $click={() => $.baz++}>{props.foo},{props.bar},{$.baz}</div>
}