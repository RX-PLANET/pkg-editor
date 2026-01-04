import $ from "jquery";

function renderGallery(vm, selector = ".c-article img") {
    $(selector).each((i, ele) => {
        // 加载全部src（lazyload）
        vm.images.push($(ele).attr("src"));
        // 绑定事件挂钩索引位置
        $(ele).on("click", (e) => {
            vm.gallery_index = i;
        });
    });
}

export default renderGallery;
