import { setLocaleData } from "monaco-editor-nls"
import * as zhCn from "monaco-editor-nls/locale/zh-hans"
setLocaleData(zhCn)
require("monaco-editor");
(self as any).MonacoEnvironment = {
  getWorkerUrl: () => "/static/pyEditor/editor.worker.pyEditor.js",
};
const pyEditor = require("./client");
export default pyEditor
module.exports = pyEditor
