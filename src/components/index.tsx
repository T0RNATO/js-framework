import {refs} from "~/framework/reactivity.ts";
import MyComponent from "~/components/MyComponent.tsx";

const $ = refs({
    foo: 5,
    bar: 6
})

function arbitraryReactiveFunction(value: number) {
    return `hello, ${value}`
}

export default () => <>
    <input placeholder={arbitraryReactiveFunction($.foo)}/>
    <button $click={() => $.foo++}>
        Increment foo
    </button>
    <button $click={() => $.bar++}>
        Increment bar
    </button>
    <MyComponent foo={$.foo} bar={$.bar}/>
</>
