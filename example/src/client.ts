import { listen, MessageConnection } from "vscode-ws-jsonrpc";
// import { setLocaleData } from "monaco-editor-nls"
// import * as zhCn from "monaco-editor-nls/locale/zh-hans"
// setLocaleData(zhCn)
import * as monaco from "monaco-editor";
// (self as any).MonacoEnvironment = {
//   getWorkerUrl: () => "/static/pyEditor/editor.worker.pyEditor.js",
// };
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
  MonacoServices,
  createConnection,
} from "monaco-languageclient";
const ReconnectingWebSocket = require("reconnecting-websocket");

// register Monaco languages
monaco.languages.register({
  id: "python",
  extensions: [".python", ".py", ".pyd"],
  aliases: ["Python", "python"],
  mimetypes: ["application/json"],
});

/**
 * @Author: zjs
 * @Date: 2023-11-13 13:44:45
 * @Description:  创建 sokect 连接
 */
const createWebSocket = (url: string): WebSocket => {
  const socketOptions = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 10000,
    maxRetries: Infinity,
    debug: false,
  };
  return new ReconnectingWebSocket(url, [], socketOptions);
}


/**
 * @Author: zjs
 * @Date: 2023-11-13 13:44:45
 * @Description:  创建 语言服务器
 */
const createLanguageClient = (
  connection: MessageConnection
): MonacoLanguageClient => {
  return new MonacoLanguageClient({
    name: "Sample Language Client",
    clientOptions: {
      // use a language id as a document selector
      documentSelector: ["python"],
      // disable the default error handler
      errorHandler: {
        error: () => ErrorAction.Continue,
        closed: () => CloseAction.DoNotRestart,
      },
    },
    // create a language client connection from the JSON RPC connection on demand
    connectionProvider: {
      get: (errorHandler, closeHandler) => {
        return Promise.resolve(
          createConnection(connection, errorHandler, closeHandler)
        );
      },
    },
  });
}

/**
 * @Author: zjs
 * @Date: 2023-11-13 13:49:10
 * @Description: 创建 语言服务长连接 并通讯
 */
const createPySokect = (url = "ws://127.0.0.1:5000/python") => {
  return new Promise((res, rej) => {
    try {
      const webSocket = createWebSocket(url);

      // 监听何时打开web套接字
      listen({
        webSocket,
        onConnection: (connection: any) => {
          // 创建并启动语言客户端
          const languageClient = createLanguageClient(connection);
          const disposable = languageClient.start();
          connection.onClose(() => disposable.dispose());
          res(null)
        },
      });
    } catch (error) {
      rej()
    }
  })
}

const monacoList: any[] = []
/**
 * @Author: zjs
 * @Date: 2023-11-13 13:50:37
 * @Description: 注册编辑器
 */
const installEditor = (dom = document.getElementById("pythonEditorDom"), options: any = {}) => {
  const {
    initValue = '',
    modelUrl = 'model.json',
    theme = "vs",
  } = options
  const editor = monaco.editor.create(dom!, {
    model: monaco.editor.createModel(
      initValue,
      "python",
      monaco.Uri.parse(`inmemory://${modelUrl}`)
    ),
    glyphMargin: true,
    theme,
    lightbulb: {
      enabled: true,
    },
    ...options
  });
  console.log(monacoList)
  monacoList.push(editor)
  MonacoServices.install(editor);
  return editor
}

/**
 * @Author: zjs
 * @Date: 2023-11-13 13:57:42
 * @Description: 获取编辑器实例
 */
const getMonaco = () => monaco

export default {
  installEditor,
  createPySokect,
  getMonaco
}
module.exports = {
  installEditor,
  createPySokect,
  getMonaco
} 