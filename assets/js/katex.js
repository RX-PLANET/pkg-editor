import $ from "jquery";
import katex from "katex/dist/katex.mjs";
import "katex/dist/katex.css";
// katex.render("x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}", document.getElementById("math"));

function renderKatex(selector = ".w-latex") {
    try {
        $(selector).each(function () {
            let $katex = $(this);
            let raw = $katex.text();
            katex.render(raw, $katex.get(0));
        });
    } catch (e) {
        console.error(e);
    }
}
export default renderKatex;
