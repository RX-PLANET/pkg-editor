import hljs from "highlight.js";
import "highlight.js/styles/github.css";

function renderCode(selector) {
    if (!selector) {
        hljs.configure({
            cssSelector: selector,
        });
    }
    hljs.highlightAll();
}

export default renderCode;
