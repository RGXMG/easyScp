/* eslint-disable */
const path = require('path');

// 保存server信息
const server = getServerInfo();

/**
 * 获取server的信息
 * @returns {*}
 */
function getServerInfo() {
  return process.env.NODE_ENV === 'production'
    ? {
      host: '',
      username: 'root',
      // 密匙路径
      // 可以使用 deploy-li --keygen [密码] 生成
      privateKey: '',
      // 服务器端口号
      port: '',
      // 项目文件路径
      path: '/usr/nginx/html/',
      // 垃圾桶文件路径
      trashPath: '/usr/nginx/html/trashes',
    }
    : {
      host: '',
      username: 'root',
      privateKey: '',
      port: '',
      path: '/home/work/docker_md/nginx/html/',
      trashPath: '/home/work/docker_md/nginx/html/trashes',
    };
}

/**
 * 打印需要提示的信息gpoh
 * 可以自己更改
 * @returns {string}
 */
function preHint() {
  return `\n 当前process.env.NODE_ENV：${process.env.NODE_ENV} \n 上传服务器为：${server.host} \n 上传路径为：${server.path} \n 垃圾路径为：${server.trashPath}`;
}

module.exports = {
  // 暂时只支持scp上传，为后续上传扩展留下接口
  mode: 'scp',
  // 需要绝对路径
  target: path.join(__dirname, './dist'),
  // 上传之前的提示打印
  // 在这里面你可以给出提示，用于区分环境等信息
  // 该信息会追加到当前上传文件的列表后面
  // eg：当前目录下存在[1.txt,js,main.js]文件，是否进行部署？(当前process.env.production：false)
  preHint,
  // 是否打印上传文件的log
  verbose: true,
  // 服务的配置
  // 可以接受一个函数以及一个对象
  // 如果返回的对象中不包含host/username/port/path，会提示用户进行输入
  server,
};
