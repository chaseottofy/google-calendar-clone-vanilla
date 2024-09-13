const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
// const BundelAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// "analyze": "webpack --profile --json > stats.json"
// const postcssPresetEnv = require('postcss-preset-env');
// const autoprefixer = require('autoprefixer');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const { mode } = argv;
  const isDev = mode === 'development';
  const config = {
    entry: './src/index.js',
    mode: mode,
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      port: 3000,
      open: true,
      hot: true,
      compress: true,
    },
    devtool: isDev ? 'source-map' : false,
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          exclude: /node_modules/,
          use: ['source-map-loader'],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.woff2?$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(ico|png|svg|webp|)$/i,
          type: 'asset/resource',
        },
      ],
    },

    plugins: [
      new WebpackManifestPlugin(
        {
          fileName: 'manifest.json',
          basePath: 'dist/',
        },
      ),
      new HtmlWebpackPlugin({
        title: 'google-calendar-clone-vanilla',
        template: './src/index.html',
        favicon: './src/favicon.ico',
        filename: 'index.html',
        inject: 'head',
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
        },
      }),
      new MiniCssExtractPlugin(),
    ],

    optimization: {
      minimize: !isDev,
      minimizer: [
        new TerserPlugin({
          extractComments: true,
        }),
        new CssMinimizerPlugin(),
      ],
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
  };

  return config;
};
