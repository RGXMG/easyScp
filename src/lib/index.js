const Scp = require('./Scp');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const DEPLOY_TYPE = {
  SCP: 'scp'
};
/**
 * 根据当前page记载环境配置
 * 上传当前dist打包后的所有文件
 * @returns {Promise<void>}
 */
async function run() {
  const { target, server = {}, ...rest } = await getCompletedConfig();
  try {
    const res = fs.readdirSync(target);
    // 开启询问
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'needUp',
        message: `当前目录下存在[${res.join()}]文件，是否进行部署？(${typeof rest.preHint === 'function' ? rest.preHint() : ''})`,
      }
    ]);
    if (answers.needUp) {
      new Scp(target, server, rest).start();
    }
  } catch (e) {
    return console.log(
      chalk.red(`[未找到需要上传的文件，请检查是否已经打包文件或者文件夹配置是否正确？] ${target} ${e}`)
    );
  }
}
async function getCompletedConfig() {
  let config = require(path.join(process.cwd(), 'easy-project-scp.config.js'));
  if (!config.target) {
    throw new Error('不存在target');
  }
  // 发出询问
  if (!config.mode) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: '选择部署方式?',
        choices: [DEPLOY_TYPE.SCP]
      }
    ]);
    config.mode = answers.mode;
  }
  return config;
}
module.exports = run;
