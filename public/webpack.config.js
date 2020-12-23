const webpack = require("webpack");

const frontend = {
  mode: process.env.NODE_ENV || "development",
  target: "web",
  entry: "./javascripts/main.ts",
  output: {
    path: __dirname + "/dist",
    filename: "[name].js"
  },
  devtool: "source-map",
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "buffer": require.resolve("buffer"),
      "stream": require.resolve("stream-browserify")
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader"
      }, {
        test: /\.s[ac]ss$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'ignore-loader'
      }
    ]
  }
};

module.exports = frontend;
