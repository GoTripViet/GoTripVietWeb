const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devServer: { port: 3002, historyApiFallback: true },
  output: { publicPath: 'auto' },
  module: {
    rules: [
      { test: /\.m?jsx?$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.css$/, use: ['style-loader','css-loader'] }
    ]
  },
  resolve: { extensions: ['.js','.jsx'] },
  plugins: [
    new ModuleFederationPlugin({
      name: 'auth', // dashboard / booking tương ứng
      filename: 'remoteEntry.js',
      exposes: { './App': './src/App' },
      shared: {
        react: { singleton: true, requiredVersion: deps.react, eager: true },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'], eager: true },
        'react/jsx-runtime': { singleton: true, requiredVersion: deps.react, eager: true },
        'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] }
      }
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ]
};
