const moment = require('moment');
const scp2 = require('scp2');
const inquirer = require('inquirer');
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ssh2 = require('ssh2');
const {  deGenKey } = require('./encrypt');
module.exports = class Scp {
  constructor(target, server, options = {}) {
    try {
      this.spinner = null;
      this.target = target;
      this.server = server;
      this.options = options;
      this.startTime = void 0;
      this.endTime = void 0;
      // 链接成功flag
      this.connectSuccess = false;
      this.onError = null;
    } catch (e) {
      throw new Error('server信息不完整！');
    }
  }
  getConnectAuthValue() {
    const {
      port,
      host,
      privateKey,
      username,
      password
    } = this;
    const valuesForRemote = {
      port,
      host,
      username,
    };
    if (privateKey) {
      valuesForRemote.password = deGenKey(fs.readFileSync(path.normalize(privateKey), 'utf-8'));
    } else {
      valuesForRemote.password = password;
    }
    return valuesForRemote;
  }
  async getCompletedServer(server = {}) {
    try {
      const { port, host, username, password, privateKey, path, trashPath, trashName } = typeof server === 'function' ? server() : server;
      const questions = [];
      if (!host) {
        questions.push({
          type: 'input',
          name: 'host',
          message: '你要部署到哪个服务器?'
        });
      }
      if (!username) {
        questions.push({
          type: 'input',
          name: 'username',
          message: '服务器登录用户名?'
        });
      }
      if (!password && !privateKey) {
        questions.push({
          type: 'password',
          name: 'password',
          message: '登录密码?',
          mask: '*'
        });
      }
      if (!path) {
        questions.push({
          type: 'input',
          name: 'path',
          message: '上传到服务器哪个目录?'
        });
      }
      if (questions.length > 0)
        await inquirer.prompt(questions).then(answers => {
          if (answers.host) this.host = answers.host;
          if (answers.username) this.username = answers.username;
          if (answers.password) this.password = answers.password;
          if (answers.path) this.path = answers.path;
        });
      this.port = port;
      this.host = host;
      this.username = username;
      this.password = password;
      this.privateKey = privateKey;
      this.path = path;
      this.trashPath = trashPath;
      this.trashName = trashName;
    } catch (e) {
      throw new Error(e);
    }
  }
  start() {
    return new Promise(async (resolve, reject) => {
      await this.getCompletedServer(this.server);
      this.createSSHClient(resolve, reject);
      const onError = err => reject(`${this.host}: ${err}`);
      const {port,
        host,
        username,
        password} = this;
      if (this.trashPath) {
        // 是否可以通过
        // 当stream返回data,按照当前执行的命令，既可以判断是错误
        let throughPass = true;
        const Client = new ssh2.Client();
        Client.on('ready', () => {
          this.mvToTrash(Client, (err, stream) => {
            if (err) onError(err);
            stream.stderr
              .on('data', function(data) {
                throughPass = false;
                onError(data);
              })
              .on('close', () => {
                this.spinner.succeed();
                if (throughPass) {
                  this.execute(resolve, reject);
                }
              });
          });
        })
          .on('error', function(err) {
            onError(err);
          })
          .connect(this.getConnectAuthValue());
      } else this.execute(resolve, reject);
    });
  }
  createSSHClient(resolve, reject) {
    const {
      options,
      host,
    } = this;
    const sshC = this.sshClient = new scp2.Client(this.getConnectAuthValue());
    sshC.on('ready', () => {
      this.connectSuccess = true;
      this.startTime = new Date();
      console.log(chalk.cyan(host + ' [开始上传] ' + this.startTime));
    });
    if (options.verbose) {
      sshC.on('write', function(p) {
        console.log(chalk.yellow(p.source + ' => ' + host + '@' + p.destination));
      });
    }
    sshC.on('end', () => {
      this.endTime = new Date();
      if (this.connectSuccess) console.log(chalk.cyan(host + ' [上传结束] ' + new Date()));
    });
    sshC.on('error', function(err) {
      reject(`${host}: ${err}`);
    });
    sshC.on('close', () => {
      if (this.connectSuccess) {
        console.log(chalk.cyan(host + ' 上传用时: [' + (+this.endTime - +this.startTime) / 1000 + '] 秒!'));
        resolve();
      }
    });
  }
  execute(resolve, reject) {
    scp2.scp(this.target, { path: this.path }, this.sshClient, function(err) {
      if (err) {
        reject(`${this.host}: ${err}`);
      }
    });
  }
  mvToTrash(Client, cb) {
  // 创建当前时间点的文件夹
  const trashDirName = moment().format('YYYY-MM-DD_hh:mm:ss');
  // 去掉'/'的路径
  const srcPath = this.path;
  // 项目名称
  const projectName = srcPath.substring(srcPath.lastIndexOf('/') + 1);
  // 最终的trashPath
  const tp = this.trashPath + '/' + projectName + '_' + trashDirName;
  // 开启spinner
  this.spinner = ora(chalk.cyan(this.host + '@' + srcPath + '=>' + tp + ' [移动旧文件到回收站] ')).start();
  // 命令行
  const command = `mkdir ${tp}\ntouch ${srcPath}/scp.log\nmv ${srcPath}/* ${tp}`;
  Client.exec(command, cb);
};
}
