const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devServer: { port: 3000, historyApiFallback: true },
  output: { publicPath: 'auto' },
  module: {
    rules: [
      { test: /\.m?jsx?$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  resolve: { extensions: ['.js', '.jsx'] },
  plugins: [
    new ModuleFederationPlugin({
      name: 'container',
      remotes: {
        auth: 'auth@http://localhost:3001/remoteEntry.js',
        dashboard: 'dashboard@http://localhost:3002/remoteEntry.js',
        booking: 'booking@http://localhost:3003/remoteEntry.js'
      },
      shared: {
        react: { singleton: true, requiredVersion: deps.react, eager: true },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'], eager: true },
        'react/jsx-runtime': { singleton: true, requiredVersion: deps.react, eager: true },
        'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] },
        bootstrap: { singleton: true, requiredVersion: deps.bootstrap }
      }
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ]
};
