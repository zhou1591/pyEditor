/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const path = require("path");
const lib = path.resolve(__dirname, "lib");

const webpack = require("webpack");
const merge = require("webpack-merge");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const MonacoWebpackPlugin = require('monaco-editor-esm-webpack-plugin');
const common = {
  entry: {
    main: path.resolve(lib, "main.js"),
    "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
  },
  output: {
    publicPath:"./static/pyEditor/",
    filename: "[name].pyEditor.js",
    path:  path.resolve(__dirname, "pyEditor"),
    libraryTarget: 'commonjs2', // 定义模块运行的方式，将它的值设为umd
  },
  module: {
    rules: [
      {
				test: /\.js/,
				enforce: 'pre',
				include: /node_modules[\\\/]monaco-editor[\\\/]esm/,
				use: MonacoWebpackPlugin.loader
			},
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ttf$/,
        use: ["file-loader"],
      },
    ],
  },
  plugins: [
    new MonacoWebpackPlugin(),
  ],
  target: "web",
  node: {
    fs: "empty",
    child_process: "empty",
    net: "empty",
    crypto: "empty",
  },
  resolve: {
    alias: {
      vscode: require.resolve("monaco-languageclient/lib/vscode-compatibility"),
      "vscode-languageserver-protocol/lib/main":
        "vscode-languageserver-protocol/lib/browser/main",
      "vscode-languageserver-protocol/lib/utils/is":
        "vscode-languageserver-protocol/lib/common/utils/is",
    },
    extensions: [".js", ".json", ".ttf"],
  },
};

// if (process.env["NODE_ENV"] === "production") {
  module.exports = merge(common, {
    plugins: [
      new UglifyJSPlugin(),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
    ],
  });
// } else {
//   module.exports = merge(common, {
//     devtool: "source-map",
//     module: {
//       rules: [
//         {
//           test: /\.js$/,
//           enforce: "pre",
//           loader: "source-map-loader",
//           // These modules seems to have broken sourcemaps, exclude them to prevent an error flood in the logs
//           exclude: [
//             /vscode-jsonrpc/,
//             /vscode-languageclient/,
//             /vscode-languageserver-protocol/,
//           ],
//         },
//       ],
//     },
//   });
// }
