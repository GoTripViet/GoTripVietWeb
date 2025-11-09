import path from "path";
import { container as rcontainer } from "@rspack/core";
import HtmlPlugin from "html-rspack-plugin";
import ReactRefreshPlugin from "@rspack/plugin-react-refresh";
import mf from "./module-federation.config";
const { ModuleFederationPlugin } = rcontainer;
const isDev = process.env.NODE_ENV !== "production";

export default {
  entry: "./src/index.ts",
  output: { publicPath: "auto" },
  experiments: { css: true },
  devServer: {
    port: 4000,
    hot: true,
    historyApiFallback: true,
    static: { directory: path.join(__dirname) },
    headers: { "Access-Control-Allow-Origin": "*" },
  },
  module: {
    rules: [
      { test: /\.(t|j)sx?$/, loader: "builtin:swc-loader",
        options:{ jsc:{ transform:{ react:{ development:isDev, refresh:isDev }}}}},
      { test: /\.css$/i, type: "css" },
      { test: /\.(png|jpe?g|gif|svg|woff2?|ttf|eot|otf)$/i, type: "asset" }
    ]
  },
  plugins: [
    new HtmlPlugin({ template: "./index.html" }),
    isDev ? new ReactRefreshPlugin() : undefined,
    new ModuleFederationPlugin(mf),
  ].filter(Boolean),
};
