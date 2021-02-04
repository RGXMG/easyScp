#! /usr/bin/env node --max_old_space_size=6144
const easyProjectScp = require('./lib');
const { createGenKey } = require('./lib/encrypt');
const fs = require('fs');
const path = require('path');

/**
 * 临时新增一个功能，生成key
 * @param str
 */
function genKey(str) {
  return createGenKey(str);
}

/**
 * 临时新增一个生成config文件的功能
 */
function genConfig() {
  const file = fs.readFileSync(path.join(__dirname, './config/config.js'), 'utf-8');
  fs.writeFileSync(path.join(process.cwd(), 'easy-project-scp.config.js'), file);
  console.log('---------------------generator config file done--------------------------');
}


const argv = process.argv;
const command = argv[2];

switch (command) {
  case '--keygen':
  {
    const pwd = argv[3];
    if (!pwd) {
      throw new Error('key cannot be undefined!');
    }
    return '';
  }
  case '--config':
    return genConfig();
  default: {
    if (command) {
      throw new Error(`Unknown command: ${command}`);
    } else easyProjectScp();
  }
}

