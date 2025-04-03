import './style.css';
import App from "~/components/index.tsx"
import {render} from "~/framework/reactivity.ts";

render(document.querySelector("#app")!, App());