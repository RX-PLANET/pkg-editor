// 图片地址&懒加载
function lazyLoad(str, domain = "") {
    if (!str) return;

    if (str.startsWith("/")) {
        return domain + str;
    }
    return str;
}
export default lazyLoad;
