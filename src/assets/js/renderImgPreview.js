import $ from "jquery";
import "viewerjs/dist/viewer.css";
import Viewer from "viewerjs";

export function getImgViewer(ele) {
    return new Viewer(ele, {
        toolbar: false,
        navbar: false,
    });
}

export function showImgPreview(ele) {
    const viewer = getImgViewer(ele);
    viewer.show();
}

function renderImgPreview(rootEl = ".c-article", selector = "img") {
    const $root = typeof rootEl === "string" ? $(rootEl) : $(rootEl);
    const imgs = ($root.is(selector) ? $root : $root.find(selector)).filter(function () {
        return $(this).attr("src") != "";
    });
    imgs.each((i, ele) => {
        getImgViewer(ele);
    });
}

export default renderImgPreview;
