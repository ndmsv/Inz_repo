const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js', // Path to the main js file
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js' // Name of the bundled file
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Rule for .js files
        exclude: /node_modules/, // Do not process node_modules
        use: {
          loader: 'babel-loader', // Use babel-loader for these files
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'] // Use presets for env and React
          }
        }
      },
      {
        test: /\.css$/, // Rule for .css files
        use: ['style-loader', 'css-loader'] // Use these loaders for CSS files
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html' // Template file
    })
  ],
  mode: 'development' // Mode can be 'development' or 'production'
};
