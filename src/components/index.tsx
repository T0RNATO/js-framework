import {refs} from "~/framework/reactivity.ts";
import MyComponent from "~/components/MyComponent.tsx";

const awd = refs({
    foo: 5,
    bar: 6
})

function arbitraryReactiveFunction(value: number) {
    return `hello, ${value}`
}

export default () => <>
    <input placeholder={arbitraryReactiveFunction(awd.foo)}/>
    <button $click={() => awd.foo++}>
        Increment foo
    </button>
    <button $click={() => awd.bar++}>
        Increment bar
    </button>
    <MyComponent foo={awd.foo} bar={awd.bar}/>
</>
