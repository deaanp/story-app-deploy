const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin(),

    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/public/app.webmanifest', to: 'app.webmanifest' },
        { from: 'src/public/icons', to: 'icons' },
        { from: 'src/public/images', to: 'images' },
      ],
    }),

    new WorkboxWebpackPlugin.InjectManifest({
      swSrc: './src/public/sw.js',
      swDest: 'sw.js',
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    }),
  ],
  output: {
    filename: 'app.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './',
  },
});
