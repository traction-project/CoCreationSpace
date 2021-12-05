const webpack = require("webpack");

const frontend = {
  mode: process.env.NODE_ENV || "development",
  target: "web",
  entry: {
    bundle: "./javascripts/main.ts"
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].js"
  },
  devtool: "source-map",
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "buffer": require.resolve("buffer"),
      "stream": require.resolve("stream-browserify"),
      "fs": false,
      "path": false,
      "crypto": false
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
          { loader: "style-loader" },
          { loader: "css-loader", options: { url: false }},
          { loader: "sass-loader" }
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
