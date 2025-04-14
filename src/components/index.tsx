import {refs} from "~/framework/reactivity.ts";

const $ = refs({
    obj: [1,2,3]
})

export default function(){
    return <>
        hello
        {$.obj[1]}
        <button $click={() => $.obj[1]++}>awd</button>
    </>
}