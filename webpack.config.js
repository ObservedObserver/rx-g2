const path = require("path");
// const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, args) => {
  console.log("webpack args: ", args);
  const devContentBase = path.join(__dirname, "demo");
  const prodContentBase = path.join(__dirname, "build");
  return {
    entry: "./demo/index.ts",
    devtool: "inline-source-map",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        { test: /\.css$/, use: ["style-loader", "css-loader"] },
      ],
    },
    devServer: {
      contentBase:
        args.mode === "production" ? prodContentBase : devContentBase,
      compress: true,
      port: 9000,
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: "bundle.js",
      path: args.mode === "production" ? prodContentBase : devContentBase,
    },
    // plugins: [new HtmlWebpackPlugin()],
  };
};
