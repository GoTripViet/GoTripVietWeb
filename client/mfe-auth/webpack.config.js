const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;


module.exports = {
    entry: './src/index.js',
    mode: 'development',
    devServer: { port: 3001, historyApiFallback: true },
    output: { publicPath: 'auto' },
    module: {
        rules: [
            { test: /\.m?js$/, exclude: /node_modules/, use: { loader: 'babel-loader' } },
            { test: /\.jsx?$/, exclude: /node_modules/, use: { loader: 'babel-loader' } },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] }
        ]
    },
    resolve: { extensions: ['.js', '.jsx'] },
    plugins: [
        new ModuleFederationPlugin({
            name: 'auth',
            filename: 'remoteEntry.js',
            exposes: { './App': './src/App' },
            shared: {
                react: { singleton: true, requiredVersion: deps.react },
                'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
                'react/jsx-runtime': { singleton: true, requiredVersion: deps.react },
                'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] }
            }
        }),
        new HtmlWebpackPlugin({ template: './public/index.html' })
    ]
};