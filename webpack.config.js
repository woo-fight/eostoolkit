const webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path')
module.exports = {
  entry: ['react-hot-loader/patch', './src/index.jsx'],
  module: {
    rules: [
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: ['babel-loader'] },
      { test:/\.css$/, use:['style-loader','css-loader']}
    ],
  },
  resolve: { 
    extensions: ['*', '.js', '.jsx'], 
    alias: {
      'scatter-client':
          path.resolve(__dirname, 'src/services/scatter-client.js'),
      'lottery': path.resolve(__dirname, 'src/services/lottery.js'),
      'config': path.resolve(__dirname, 'src/services/config.js'),
    }
  },
  output: { path: __dirname + '/dist', publicPath: '/', filename: '[name].[hash].js' },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({hash: true, template: 'src/index.html'})
  ],
  devServer: { contentBase: './dist', hot: true }
};
