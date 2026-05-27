module.exports = {

    // CDN拼接(用于处理上传为相对路径时拼接的cdn前缀)
    /*------------------*/
    cdnRoot: `${process.env.VUE_APP_CDN_ROOT || "https://cdn.2kog.com/"}`,
    staticRoot: process.env.VUE_APP_TINYMCE_DEV === "true"
        ? `http://localhost:${process.env.VUE_APP_TINYMCE_PORT || 5120}`
        : `${process.env.VUE_APP_STATIC_ROOT || "https://static.2kog.com/"}`,

    // 编辑器
    /*------------------*/
    tinymcePath: `${process.env.VUE_APP_TINYMCE_PATH || "/static/tinymce"}`, // tinymce路径(相对于staticRoot)
    tinymce: {
        language: "zh_CN",
        plugins: [
            "link autolink",
            "hr lists advlist table codeinline codesample checklist foldtext latex",
            "image emoticons media",
            "code fullscreen wordcount powerpaste pagebreak printpage", // template anchor autosave
        ],
        toolbar: [
            "undo | formatselect | fontsizeselect | forecolor backcolor | bold italic underline strikethrough superscript subscript | link unlink | fullscreen code", //restoredraft
            "removeformat | hr alignleft aligncenter alignright alignjustify indent outdent | bullist numlist checklist table blockquote foldtext codeinline codesample latex | image media", // template anchor
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
    },


    // 上传组件
    /*------------------*/
    uploadMax: 10, // 单次上传最大文件数
    uploadSizeLimit: 200, // 单个文件大小限制(MB)
    uploadAccept: "*", // 上传文件类型
    // uploadAccept: "image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar", // 上传文件类型
}
