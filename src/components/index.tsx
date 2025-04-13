import {refs} from "~/framework/reactivity.ts";
import MyComponent from "~/components/MyComponent.tsx";

const $ = refs({
    list: [5,6,7]
})

export default () => <>
    hello
    {$.list.map(val => <MyComponent foo={val}/>)}
    {/*<button $click={() => $.list[0] = 8}></button>*/}
</>
