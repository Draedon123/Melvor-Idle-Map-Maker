const path = require("path");
const TerserPluglin = require("terser-webpack-plugin");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const mode = "development";

const optimization = {
  minimize: mode === "production",
  minimizer: [new TerserPluglin({
    extractComments: false,
    parallel: true,
    terserOptions: {
      mangle: mode === "production",
      compress: mode === "production",
      keep_classnames: mode === "development",
      keep_fnames: mode === "development",
      format: {
        comments: mode === "development",
      }
    }
  })]
}

const modules = {
  rules: [
    {
      test: /\.tsx?$/,
      use: "ts-loader",
      exclude: /node_modules/
    },
    {
      test: /\.css$/i,
      use: [{
        loader: "style-loader",
        options: {injectType: "singletonStyleTag"}
      }, {
        loader: "css-loader",
        options: {
          modules: true
        }
      }],
    },
    {
      test: /\.(png|svg|jpg|jpeg|gif)$/i,
      type: "asset/resource",
    },
  ]
}

const resolve = {
  extensions: [".ts", ".js"],
  fallback: {
    "path": require.resolve("path-browserify"),
    "http": require.resolve("stream-http"),
    "fs": require.resolve("browserify-fs"),
    "url": require.resolve("url/"),
    "buffer": require.resolve("buffer/"),
    "stream": require.resolve("stream-browserify"),
    "util": require.resolve("util/"),
    "crypto": require.resolve("crypto-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "assert": require.resolve("assert/"),
  },
  alias: {
    process: "process/browser",
  }
}

module.exports = [
  {
    mode,
    devServer: {
      static: {
        directory: path.join(__dirname, "build"),
      },
      port: 9000,
    },
    entry: {
      script: "./src/script.ts",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "build"),
    },
    target: ["web"],
    resolve,
    module: modules,
    plugins: [
      new HTMLPlugin({
        template: "src/index.html",
        cache: true,
      }),
      new CopyPlugin({
        patterns: [
          {
            from: "src/*.wasm",
            to: "[name][ext]",
          },
          {
            from: "src/*.js",
            to: "[name][ext]",
          },
          {
            from: "favicon.ico",
            to: "favicon.ico",
            context: "src",
            noErrorOnMissing: false,
          },
          {
            from: "assets",
            to: "assets",
            context: "src",
            noErrorOnMissing: false,
          }
        ]
      }),
    ],
    optimization,
  },
  {
    mode,
    entry: "./src/basisWorker.ts",
    output: {
      filename: "basisWorker.js",
      path: path.resolve(__dirname, "build"),
    },
    target: ["webworker"],
    resolve,
    module: modules,
    optimization,
  }
];