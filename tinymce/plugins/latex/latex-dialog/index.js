// 加载 Tab 内容
const dialogBase = window.LATEX_DIALOG_BASE || new URL("latex-dialog/", window.location.href).href;

async function loadTabContent() {
    try {
        const usageResponse = await fetch(new URL("usage-content.html", dialogBase).href);
        const usageHtml = await usageResponse.text();
        document.querySelector('.tab-pane[data-tab="usage"]').innerHTML = usageHtml;

        const helpResponse = await fetch(new URL("help-content.html", dialogBase).href);
        const helpHtml = await helpResponse.text();
        document.querySelector('.tab-pane[data-tab="help"]').innerHTML = helpHtml;

        // 渲染示例中的 LaTeX
        if (window.LatexRenderer) {
            renderExamples();
        }
    } catch (error) {
        console.error('加载内容失败:', error);
    }
}

// 渲染示例中的 LaTeX 公式
function renderExamples() {
    // 渲染行内示例
    document.querySelectorAll('.inline-example').forEach(el => {
        const latex = el.textContent.trim();
        if (latex.startsWith('$') && latex.endsWith('$')) {
            const formula = latex.slice(1, -1);
            el.innerHTML = window.LatexRenderer.renderToString(formula, { displayMode: false });
        } else if (latex.startsWith('\\(') && latex.endsWith('\\)')) {
            const formula = latex.slice(2, -2);
            el.innerHTML = window.LatexRenderer.renderToString(formula, { displayMode: false });
        }
    });

    // 渲染块级示例
    document.querySelectorAll('.block-example').forEach(el => {
        const latex = el.textContent.trim();
        if (latex.startsWith('$$') && latex.endsWith('$$')) {
            const formula = latex.slice(2, -2).trim();
            window.LatexRenderer.render(el, formula, { displayMode: true });
        } else if (latex.startsWith('\\[') && latex.endsWith('\\]')) {
            const formula = latex.slice(2, -2).trim();
            window.LatexRenderer.render(el, formula, { displayMode: true });
        } else if (el.classList.contains('w-latex')) {
            const formula = latex;
            window.LatexRenderer.render(el, formula, { displayMode: true });
        }
    });
}

// 页面加载时加载内容
if (document.readyState === 'loading') {
    // 文档还在加载中，等待 DOMContentLoaded
    window.addEventListener('DOMContentLoaded', () => {
        loadTabContent();
    });
} else {
    // 文档已经加载完成，直接执行
    loadTabContent();
}

// Tab 切换
document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        const name = tab.dataset.tab;

        document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));

        document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));

        tab.classList.add("active");
        document.querySelector(`.tab-pane[data-tab="${name}"]`)?.classList.add("active");
    });
});

// textarea → 渲染区实时预览
const input = document.getElementById("latex-input");
const preview = document.getElementById("latex-preview");

input.addEventListener("input", () => {
    const latex = input.value.trim();

    if (!latex) {
        if (window.LatexRenderer) {
            window.LatexRenderer.clear(preview);
        } else {
            preview.innerHTML = '<span class="placeholder">公式预览</span>';
        }
        return;
    }

    // 使用 LatexRenderer 渲染
    if (window.LatexRenderer) {
        preview.innerHTML = ''; // 清空
        window.LatexRenderer.render(preview, latex, {
            displayMode: true
        });
    } else {
        preview.textContent = '渲染器未加载';
    }
});

// 插入
document.getElementById("insert").onclick = () => {
    const latex = input.value.trim();
    if (!latex) return;

    window.parent.postMessage(
        {
            source: "tinymce-latex",
            type: "insert",
            payload: { latex },
        },
        "*"
    );
};

// 取消
document.getElementById("cancel").onclick = () => {
    window.parent.postMessage(
        {
            source: "tinymce-latex",
            type: "close",
        },
        "*"
    );
};
