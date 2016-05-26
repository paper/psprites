# psprites

解析css文件，提取里面的图片生成雪碧图并生成对应的css文件

# 说明
最紧密算法来自之前的：https://github.com/paper/auto-css-sprite 这个项目

这次做成node版本，主要是方便添加到任务中，还有添加了另外3中合成

1. 从上到下 top-down
2. 从左到右 left-right
3. 从左上到右下 diagonal

# 如何使用
请看 example 目录
```
var psprites = require('../lib/main.js');

// 这个路径是相对 example.js 的
// 或者填绝对路径
psprites.run({
    // 需要解析css的路径
    cssFrom  : './css/index.css',
    // 需要提取css里面哪些图片进行解析(css代码里面的路径)，必填。
    cssImgPath: '../img/',

    // 解析后的css放到哪里
    cssTo : './dist/css/',

    // 雪碧图放到哪里
    spritePath : './dist/img/',
    // 雪碧图的名字，可选
    spriteName : 'output3.png',

    // 可选
    // type  : 'top-down', 

    // 雪碧图片间距 可选
    space : 2,
    // 最紧密算法时，采样个数 可选
    sampleMax: 15 
}, function(){
    console.log('psprites.run: ok~ end~');
});
```

# changelog

- 0.1.0 基本功能完成 - 20160526

# 插曲

在开发过程中，图片处理考虑过 `node-canvas` 和 `gm`，后来觉得 `gm`不错，但安装使用时遇到了些坑，所以记录下来

#### gm安装

https://github.com/aheckmann/gm 这里虽然有说明如何开始，但还是遇到了坑。
所以这里说明一下（针对window系统，mac使用brew应该没问题）：

1. 去 http://www.graphicsmagick.org/ 下载 Current Release 版本
2. 安装graphicsmagick的exe文件
3. 设置 gm.exe 的环境变量。 比如我的安装地址是：C:\Program Files (x86)\GraphicsMagick-1.3.23-Q16
4. 在项目根目录运行: npm install gm
5. 搞定

安装顺序也很重要！

