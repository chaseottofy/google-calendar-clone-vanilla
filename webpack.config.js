const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3000,
    open: true,
    hot: true,
    compress: true,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(woff|woff2)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(?:ico|png|svg|webp|jpg|jpeg)$/i,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: "output management",
      template: "./src/index.html",
      filename: "testbundle.html",
      favicon: "./src/favicon.ico",
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
    }),
    new MiniCssExtractPlugin(),
    new WebpackManifestPlugin(
      {
        fileName: 'manifest.json',
        basePath: 'dist/',
      }
    ),
  ],

  optimization: {
    minimize: true,
    minimizer: [
      // prod.
      // new TerserPlugin({
      //   extractComments: true,
      // }),
      new CssMinimizerPlugin(),
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
};
// babel
// {
//   test: /\.js$/,
//   exclude: /node_modules/,
//   use: {
//     loader: "babel-loader",
//     options: {
//       presets: ["@babel/preset-env"],
//     },
//   },
// },