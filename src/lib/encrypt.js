/**
 * Created with JavaScript.
 * User: rgxmg
 * Email: rgxmg@foxmail.com
 * Date: 2020/8/19
 * Time: 11:39
 *
 */
const base64 = require('js-base64');
const fs = require('fs');
const path = require('path');
const toBase64 = base64.Base64.toBase64;
const deBase64 = base64.Base64.fromBase64;

/**
 * 创建
 * @param str {string}
 */
function genKeyManager(str) {
  const header = '-----BEGIN RSA PRIVATE KEY-----\n';
  const footer = '\n-----END RSA PRIVATE KEY-----';
  function create() {
    const count = parseInt(str.length / 64, 10);
    let endPos = 0;
    for (let i = 0; i <= count; i++) {
      endPos = (i + 1) * 64;
      str = str.substring(0, endPos) + '\n' + str.substring(endPos);
    }
    return `${header}${str}${footer}`
  }
  function deCreate() {
    return str.replace(header, '').replace(footer, '').replace(/\n|\r\n/g, '');
  }
  return {
    create,
    deCreate
  }
}
/**
 * 加料管理者
 * @param str {string}
 * @param saltType {string}
 */
function saltManager(str, saltType) {
  // 加盐的映射对象
  const saltObjMap = {
    rsa: fs.readFileSync(path.join(__dirname, './deploy'), 'utf-8'),
  };
  function sprinkleSalt() {
    const splitPos = parseInt(str.length / 2 + '', 10);
    return (
      str.substring(0, splitPos) + (saltObjMap[saltType] || saltType) + str.substring(splitPos)
    );
  }
  function rinseSlat() {
    return str.replace(saltObjMap[saltType] || saltType, '');
  }
  return {
    sprinkleSalt,
    rinseSlat,
  };
}

/**
 * 加密
 * 提供原值，以及salt
 * 1. 先对原值进行base64处理；
 * 2. 再进行位置加盐；
 * 3. 再进行多次base64翻转处理
 * @param src 原值
 * @param saltType 盐
 * @param time 翻转几次，即在加密的基础上需要再次加密， 默认俩次
 */
function encrypt(src, saltType, time = 2) {
  if (!src) return src;
  src = saltManager(toBase64(src), saltType).sprinkleSalt();
  return Array(time)
    .fill(1)
    .reduce(m => toBase64(m), src);
}

/**
 * 解密
 * 提供加密值，以及salt
 * @param securityVal
 * @param saltType
 * @param time
 * @returns {*}
 */
function decrypt(securityVal, saltType, time = 2) {
  if (!securityVal) return securityVal;
  return deBase64(
    saltManager(
      Array(time)
        .fill(1)
        .reduce(m => deBase64(m), securityVal),
      saltType
    ).rinseSlat()
  );
}
function createGenKey(str) {
  return genKeyManager(encrypt(str, 'rsa')).create();
}
function deGenKey(str) {
  return decrypt(genKeyManager(str).deCreate(), 'rsa');
}
module.exports =  { createGenKey, deGenKey };
