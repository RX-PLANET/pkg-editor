import $ from "jquery";
import "viewerjs/dist/viewer.css";
import Viewer from "viewerjs";

function renderImgPreview(selector = ".c-article img") {
    // 获取src不为空的图片
    let imgs = $(selector).filter(function () {
        return $(this).attr("src") != "";
    });
    imgs.each((i, ele) => {
        new Viewer(ele, {
            toolbar: false,
            navbar: false,
        });
    });
}

export default renderImgPreview;
