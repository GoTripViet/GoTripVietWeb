import * as path from "node:path";
import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import ReactRefreshPlugin from "@rspack/plugin-react-refresh";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";

import { mfConfig } from "./module-federation.config";

const isDev = process.env.NODE_ENV !== "production";

// target browser (giống bên mfe-home)
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

export default defineConfig({
  context: __dirname,

  entry: {
    // entry chính của mfe-listing
    main: "./src/index.ts",
  },

  resolve: {
    extensions: ["...", ".ts", ".tsx", ".js", ".jsx"],
  },

  devServer: {
    port: 4003,                 // PORT riêng cho mfe-listing
    historyApiFallback: true,
    hot: true,
    watchFiles: [path.resolve(__dirname, "src")],
  },

  output: {
    uniqueName: "mfe_listing",  // khác với các MFE khác
    publicPath: "http://localhost:4003/",
  },

  experiments: {
    css: true,
  },

  module: {
    rules: [
      // asset ảnh / svg
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset",
      },

      // CSS (giữ giống bên mfe-home, nếu home dùng loader khác thì bạn copy y chang)
      {
        test: /\.css$/,
        type: "css",
        use: ["postcss-loader"],
      },

      // TS / TSX dùng SWC (giống template Rspack + React)
      {
        test: /\.(t|j)sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: "automatic",
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
              env: {
                targets,
              },
            },
          },
        ],
      },
    ],
  },

  plugins: [
    // HTML template
    new rspack.HtmlRspackPlugin({
      template: "./index.html",
    }),

    // Module Federation
    new ModuleFederationPlugin(mfConfig),

    // React Fast Refresh chỉ bật khi dev
    ...(isDev ? [new ReactRefreshPlugin()] : []),
  ],

  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets },
      }),
    ],
  },
});
