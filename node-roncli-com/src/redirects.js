const path = require("path");

/** @type {{[x: string]: {path: string, contentType: string, replace?: {[x: string]: string}}}} */
module.exports = {
    "/js/editor.js/editor.js": {
        path: path.join(__dirname, "../node_modules/@editorjs/editorjs/dist/editor.js"),
        contentType: "text/javascript",
        replace: {
            "tags:e": "tags:e,keepNestedBlockElements:true"
        }
    },
    "/js/editor.js/quote.js": {
        path: path.join(__dirname, "../node_modules/@editorjs/quote/dist/bundle.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/loader.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/loader.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/base/browser/ui/codicons/codicon/codicon.ttf": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/base/browser/ui/codicons/codicon/codicon.ttf"),
        contentType: "font/ttf"
    },
    "/js/monaco-editor/vs/base/worker/workerMain.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/base/worker/workerMain.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/basic-languages/css/css.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/basic-languages/css/css.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/basic-languages/html/html.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/basic-languages/html/html.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/basic-languages/javascript/javascript.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/basic-languages/javascript/javascript.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/editor/editor.main.css": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/editor/editor.main.css"),
        contentType: "text/css"
    },
    "/js/monaco-editor/vs/editor/editor.main.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/editor/editor.main.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/editor/editor.main.nls.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/editor/editor.main.nls.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/language/css/cssMode.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/language/css/cssMode.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/language/css/cssWorker.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/language/css/cssWorker.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/language/html/htmlMode.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/language/html/htmlMode.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/language/html/htmlWorker.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/language/html/htmlWorker.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/language/json/jsonMode.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/language/json/jsonMode.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/language/json/jsonWorker.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/language/json/jsonWorker.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/language/typescript/tsMode.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/language/typescript/tsMode.js"),
        contentType: "text/javascript"
    },
    "/js/monaco-editor/vs/language/typescript/tsWorker.js": {
        path: path.join(__dirname, "../node_modules/monaco-editor/min/vs/language/typescript/tsWorker.js"),
        contentType: "text/javascript"
    },
    "/js/sortable/sortable.js": {
        path: path.join(__dirname, "../node_modules/sortablejs/Sortable.min.js"),
        contentType: "text/javascript"
    },
    "/js/timeago.js/timeago.js": {
        path: path.join(__dirname, "../node_modules/timeago.js/dist/timeago.min.js"),
        contentType: "text/javascript"
    },
    "/css/bootstrap-icons.css": {
        path: path.join(__dirname, "../node_modules/bootstrap-icons/font/bootstrap-icons.css"),
        contentType: "text/css"
    },
    "/css/fonts/bootstrap-icons.woff": {
        path: path.join(__dirname, "../node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff"),
        contentType: "font/woff"
    },
    "/css/fonts/bootstrap-icons.woff2": {
        path: path.join(__dirname, "../node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff2"),
        contentType: "font/woff2"
    },
    "/css/files/archivo-narrow-all-400-normal.woff": {
        path: path.join(__dirname, "../node_modules/@fontsource/archivo-narrow/files/archivo-narrow-all-400-normal.woff"),
        contentType: "font/woff"
    },
    "/css/files/archivo-narrow-vietnamese-400-normal.woff2": {
        path: path.join(__dirname, "../node_modules/@fontsource/archivo-narrow/files/archivo-narrow-vietnamese-400-normal.woff2"),
        contentType: "font/woff2"
    },
    "/css/files/archivo-narrow-latin-ext-400-normal.woff2": {
        path: path.join(__dirname, "../node_modules/@fontsource/archivo-narrow/files/archivo-narrow-latin-ext-400-normal.woff2"),
        contentType: "font/woff2"
    },
    "/css/files/archivo-narrow-latin-400-normal.woff2": {
        path: path.join(__dirname, "../node_modules/@fontsource/archivo-narrow/files/archivo-narrow-latin-400-normal.woff2"),
        contentType: "font/woff2"
    },
    "/css/files/archivo-narrow-all-700-normal.woff": {
        path: path.join(__dirname, "../node_modules/@fontsource/archivo-narrow/files/archivo-narrow-all-700-normal.woff"),
        contentType: "font/woff"
    },
    "/css/files/archivo-narrow-vietnamese-700-normal.woff2": {
        path: path.join(__dirname, "../node_modules/@fontsource/archivo-narrow/files/archivo-narrow-vietnamese-700-normal.woff2"),
        contentType: "font/woff2"
    },
    "/css/files/archivo-narrow-latin-ext-700-normal.woff2": {
        path: path.join(__dirname, "../node_modules/@fontsource/archivo-narrow/files/archivo-narrow-latin-ext-700-normal.woff2"),
        contentType: "font/woff2"
    },
    "/css/files/archivo-narrow-latin-700-normal.woff2": {
        path: path.join(__dirname, "../node_modules/@fontsource/archivo-narrow/files/archivo-narrow-latin-700-normal.woff2"),
        contentType: "font/woff2"
    }
};
