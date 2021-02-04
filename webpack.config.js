const easyProjectScp = require('./src');
const path = require('path');
module.exports = {
  mode: 'development',
  entry: "./src/entry/1.js",
  output: {
    path: path.join(__dirname, 'dist')
  },
  plugins: [
    new easyProjectScp.WebpackPlugin()
  ]
};
