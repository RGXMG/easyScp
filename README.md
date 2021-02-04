# easy-project-scp
通过scp模块进行本地上传，上传时，会将原来文件夹里面的内容进行move操作，保证安全性；

![](https://b-ssl.duitang.com/uploads/item/201705/14/20170514133727_vSawJ.thumb.700_0.jpeg)

## install
### use yarn
- local: `yarn add easy-project-scp --dev` 【建议安装在本地】
- global: `yarn global easy-project-scp --dev`

## 命令清单

#### 根据配置文件进行上传：`deploy-cli`
#### 生成配置文件：`deploy-cli --config`
#### 根据密码生成加密后的密匙：`deploy-cli --keygen [密码] > [保存密匙的文件名]`

## 简要介绍

### easy-project-scp.config.js 配置文件

该文件必须存在项目根目录下面，现在可通过命令生成：
> 生成的配置文件会在执行命令的根目录下，可以自行更改

```javascript
deploy-cli --config
```

### 上传

#### 方式一：直接通过webpack打包时候自动上传
> 需要在webpack中进行配置，目前兼容webpack@4版本，配置完成后，会在 webpack 打包之后进行自动上传
```javascript
const easyProjectScp = require("easy-project-scp");
module.exports = {
  plugin: [new easyProjectScp.WebpackPlugin()]
};
```

#### 方式二：通过命令行工具进行上传
> 通过直接执行命令，可以运行该上传工具；
```javascript
deploy-cli
```

### 生成密匙
> 该密匙是用来上传时的服务器密码，需要自行保存在一个文件中，并且必须使用`deploy-cli --keygen [密码]` 进行创建；
