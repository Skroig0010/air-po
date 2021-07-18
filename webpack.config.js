/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsWebpackPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    path: `${__dirname}/dist`,
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: './public',
    port: 3000,
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.png$/,
        exclude: /node_modules/,
        loader: 'url-loader',
      },
      {
        test: /\.ogg$/,
        exclude: /node_modules/,
        loader: 'url-loader',
      },
      {
        test: /\.mp3$/,
        exclude: /node_modules/,
        loader: 'url-loader',
      },
      {
        test: /\.fnt$/,
        exclude: /node_modules/,
        loader: 'raw-loader',
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'html-loader',
      },
      {
        test: /\.(vert|frag)$/,
        exclude: /node_modules/,
        loader: 'raw-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [
      new TsconfigPathsWebpackPlugin({
        configFile: 'tsconfig.json',
      }),
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
}
