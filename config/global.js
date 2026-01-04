module.exports = {

    // 编辑器
    /*------------------*/
    plugins: [
        "link autolink",
        "hr lists advlist table codeinline codesample checklist foldtext latex",
        "image emoticons media",
        "code fullscreen wordcount powerpaste pagebreak printpage", // template anchor jx3icon autosave
    ],
    toolbar: [
        "undo | formatselect | fontsizeselect | forecolor backcolor | bold italic underline strikethrough superscript subscript | link unlink | fullscreen code", //restoredraft
        "removeformat | hr alignleft aligncenter alignright alignjustify indent outdent | bullist numlist checklist table blockquote foldtext codeinline codesample latex | image media", // template anchor jx3icon
    ],
    mobile: {
        toolbar_drawer: true,
        toolbar: [
            "undo emoticons bold forecolor backcolor removeformat pagebreak fullscreen",
            "hr alignleft aligncenter alignright alignjustify indent outdent bullist numlist checklist table blockquote codesample latex media",
        ],
    },
    color_map: [
        "FF99CC",
        "浅粉",
        "FF3399",
        "深粉",
        "FF0000",
        "正红",
        "CC99FF",
        "紫色",
        "9933ff",
        "深紫",

        "FFFF99",
        "浅黄",
        "FFFF00",
        "金黄",
        "FFCC00",
        "亮黄",
        "FFCC99",
        "浅桃",
        "FF6600",
        "橘色",

        "CCFFCC",
        "浅绿",
        "9bf915",
        "荧光绿",
        "00FF00",
        "辣眼绿",
        "49c10f",
        "深绿",
        "008080",
        "深青",

        "CCFFFF",
        "浅蓝",
        "00FFFF",
        "参考线",
        "00CCFF",
        "天蓝",
        "99CCFF",
        "蔚蓝",
        "0000FF",
        "辣眼蓝",

        "CC0000",
        "深红",
        "000000",
        "黑色",
    ],

    // 上传组件
    /*------------------*/
    imgTypes: ["jpg", "png", "gif", "bmp", "webp", "jpeg", "heic", "heif", "avif", "tif", "tiff","svg"],
    videoTypes: ["mp4", "mov", "avi", "flv", "3gp", "wmv", "mkv", "webm", "m4v"]
}
