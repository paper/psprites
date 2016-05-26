
var psprites = require('../lib/main.js');

// 这个路径是相对 example.js 的
// 或者填绝对路径
psprites.run({
    cssFrom  : './css/index.css',   // 需要解析css的路径
    cssImgPath: '../img/',             // 需要提取css里面哪些图片进行解析(css代码里面的路径)，必填。后续改为数组参数
    
    cssTo : './dist/css/',      // 解析后的css放到哪里
    
    spritePath : './dist/img/', // 雪碧图放到哪里
    spriteName : 'output3.png',  // 雪碧图的名字，可选
    // type  : 'top-down', // 可选
    
    space : 2, // 雪碧图片间距 可选
    sampleMax: 15 // 最紧密算法时，采样个数 可选
}, function(){
    console.log('psprites.run: ok~ end~');
});