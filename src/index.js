const scp = require("./lib");

/**
 * 主函数
 * @constructor
 */
function EasyProjectScp() {}
let notWatchMode = true;

// 注册webpack的plugin
EasyProjectScp.prototype.apply = function(compiler) {

  // 注册compiler的done事件
  compiler.hooks.done.tap("done", function() {
    notWatchMode && scp();
  });
  compiler.hooks.watchRun.tap("watchRun", function() {
    notWatchMode = false;
  });
};

scp.WebpackPlugin = EasyProjectScp;
module.exports = scp;
