import $ from "jquery";
const count = {
    H1: 0,
    H2: 0,
    H3: 0,
    H4: 0,
    H5: 0,
    H6: 0,
};
const MAX_DEPTH = 3;
const PREFIX_CLS = "lv"; //class前缀

function directory(from, to = "#directory") {
    // 装载容器设置
    const $box = $(to);
    if (!to && $box.length) return;

    // 遍历节点
    let directories = $(from).find("h1,h2,h3,h4,h5,h6");

    // 存在目录
    if (directories.length > 1) {
        let __markTags = analystics(from);

        $box.html(
            `<div class="c-article-directory" id="c-article-directory">
                <div class="c-article-directory-title" id="c-article-directory-title">
                    <span class="c-article-directory-title-label" class="c-go-top"><i class="el-icon-s-promotion"></i> 导读</span>
                    <span class="c-article-directory-title-folder" class="c-go-top">↕ 折叠</span>
                </div>
                <div class="c-article-directory-content" id="c-article-directory-content"></div>
            </div>`
        );

        const $directory = $("#c-article-directory-content");
        const $skip = $(".c-article-directory-title-skip");
        const $folder = $(".c-article-directory-title-folder");

        // 顶部按钮
        $folder.on("click", function () {
            $("#c-article-directory-content").slideToggle();
        });
        $skip.on("click", function () {
            $(document).scrollTop(0);
        });

        // 遍历捕获的目录项
        directories.each(function (i, item) {
            // 进行克隆
            let _item = $(item).clone();
            // 解决懒加载跳转位置问题
            $(item).append(`<a id="directory-${i}"></a>`);

            // 过滤行内样式
            _item.removeAttr("style");
            _item.removeAttr("align");
            _item.removeAttr("color");
            _item.html($(item).text());

            // 设置原始元素所在的位置
            // _item.attr("data-skip", ~~$(this).offset().top - 112);
            _item.data("raw", $(item));

            // 样式设置
            let _tag = $(item)[0].tagName;
            if (__markTags.includes(_tag)) {
                let lv = __markTags.indexOf(_tag) + 1;
                _item.addClass(PREFIX_CLS + lv);
            } else {
                _item.addClass(PREFIX_CLS + 0);
            }

            //追加到目录盒中
            $directory.append(_item);
        });

        // 进行事件委托
        $directory.on("click", "h1,h2,h3,h4,h5,h6", function () {
            let target = $(this).data("raw").offset().top;
            $(document).scrollTop(target - 112);
            $(this).data("raw").addClass("isScrollFocus");
            setTimeout(() => {
                $(this).data("raw").removeClass("isScrollFocus");
            }, 3500);
        });

        return true;
    }

    // 不存在目录
    return false;
}

function analystics(from) {
    // 统计各个级别
    for (let key in count) {
        count[key] = $(from).find(key).length;
    }
    // 取前3个级别
    let __c = 0;
    let __markTags = [];
    for (let key in count) {
        if (count[key]) {
            if (__c < MAX_DEPTH) {
                __c += 1;
                __markTags.push(key);
            }
        }
    }
    return __markTags;
}

export default directory;
