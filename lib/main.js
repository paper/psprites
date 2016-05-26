/**
 * 说明：
 * psprites 仅仅是生成雪碧和生成新的css文件，只做这两件事情
 * 因为用户完全可以自行利用其他插件进行改名、压缩css和图片等
 */

var images = require("images");
var fs = require('fs');
var del = require('del');
var path = require('path');
var mkdirp = require('mkdirp');
var forp = require("./algo.js");
var normalForp = require("./normalAlgo.js");

var psprites = {};

// 传图片根目录，获取这个目录的所有图片路径的集合
function explorer(imgRoot, callback){
    var result = [];
    
    function walk(imgRoot){
        
        if( fs.statSync(imgRoot).isDirectory() ){
            var files = fs.readdirSync(imgRoot);

            files.forEach( function(file) {
                var newImgRoot = path.join(imgRoot, file);
                
                if( fs.statSync(newImgRoot).isDirectory() ){
                    walk(newImgRoot);
                }else{
                    result.push(newImgRoot);
                }
            });
        }
    }

    walk(imgRoot);

    callback && callback(result);
};

// 获取图片尺寸集合
function getImgsSizes(absoluteImgsPath){
    var sizes = [];

    absoluteImgsPath.forEach(function(v){
        var size = images(v).size();
        sizes.push([size.width, size.height]);
    });
    
    return sizes;
}

// 返回 路径p的 绝对路径
function getRealPath(p){
    return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

// 解析css里面的 包含 cssImgPath 的图片路径
function parseCss(cssFrom, cssImgPath, callback){
    fs.readFile(cssFrom, 'UTF-8' ,function (err, cssStr) {
        if (err) throw err;
        
        // 取出css里面的全部图片路径
        var urls = cssStr.match(/url\(([^\)]+)\)/g);

        if( urls === null ){
            console.log('注意：css里面没有引用图片');
            return;
        }

        var cssDir = path.dirname(cssFrom); // css文件所处的文件夹路径
        
        var cssImgsPath = [];      // css文件里面写的img路径
        var absoluteImgsPath = []; // css引用图片的绝对路径
        
        var imgUrl = ''; // 提取css里面的图片路径
        
        urls.forEach(function(v){
            imgUrl = v.slice(4, -1).trim();
            
            // 确认是不是需要合并的图片 和 去重
            if( imgUrl.indexOf(cssImgPath) === 0 && cssImgsPath.indexOf(imgUrl) === -1 ){
                cssImgsPath.push(imgUrl);
                absoluteImgsPath.push( path.resolve(cssDir, imgUrl) );
            }
            
        });

        /**
         * @absoluteImgsPath {Array} css原始代码里面的图片转化为绝对路径集合
         * @cssImgsPath {Array} css原始代码里面的图片路径集合
         * @imgsPath {String} css源代码
         */
        callback && callback(absoluteImgsPath, cssImgsPath, cssStr);
    });
}

// 获取雪碧的默认名字
function getDefaultName(){
    var t = parseInt(+new Date()/1000, 10);
    var num = parseInt(Math.random() * 1000, 10);
    
    var defaultName = 'psprites_' + num + '_' + t + '.png';
    
    return defaultName;
}

function run(opt, callback){
    opt = opt || {};

    var cssFrom = getRealPath(opt.cssFrom);
    var cssImgPath = opt.cssImgPath;

    var cssFileName = path.basename(cssFrom);

    var cssTo   = getRealPath(opt.cssTo);
    
    var spritePath = getRealPath(opt.spritePath);
    var spriteName = opt.spriteName || getDefaultName();

    var space = opt.space || 1;
    var sampleMax = opt.sampleMax || 10;

    // 删除重复的雪碧图，如果有的话
    del.sync( path.join(spritePath, 'psprites_*.png') );

    // 如果没有目录创建目录
    mkdirp(cssTo);
    mkdirp(spritePath);

    parseCss(cssFrom, cssImgPath, function(absoluteImgsPath, cssImgsPath, cssStr){
        var sizes = getImgsSizes(absoluteImgsPath);

        // 根据nice数据，生成雪碧图和css文件
        function createOutImageAndCss(nice){
            // console.log(nice);

            // 新建一个透明的大图
            var img = images(nice.w, nice.h);

            // 图片对应坐标的key -> value
            // 比如：'../img/good.png' : {x:1, y:2}
            var pointForImgs = {};

            // 一个一个贴上去
            nice.r.forEach(function(v){
                var x = v.x;
                var y = v.y;

                img.draw(images(absoluteImgsPath[v.p]), x, y);

                pointForImgs[cssImgsPath[v.p]] = {
                    x: x,
                    y: y
                }
            });

            // 保存雪碧图
            var spriteFilePath = spritePath + "\\" + spriteName;
            img.save(spriteFilePath);


            // 雪碧图相对css文件的路径
            var newCssFileImgSrc = path.relative(cssTo, spriteFilePath).replace(/\\/g, '\/');

            // 新的css文件字符串
            var newCssStr = '';
            
            // 把旧的css文件进行分割，每个class或id进行分析
            var cssStrR = cssStr.split('}');

            cssStrR.forEach(function(str){

                if(str.trim().length === 0){
                    return;
                }

                // 如果在str中找到了被合并的图片
                if( str.indexOf(cssImgPath) > -1 ){
                    var imgSrc = '';

                    for(var i=0, len=cssImgsPath.length; i<len; i++){
                        // 定位 图片路径
                        if( str.indexOf(cssImgsPath[i]) > -1 ){
                            imgSrc = cssImgsPath[i];
                            break;
                        }
                    }

                    if( imgSrc !== '' ){
                        var point = pointForImgs[imgSrc];

                        // 先加上 background-position
                        var backgroundPosition = `background-position: -${point.x}px -${point.y}px;`;
                        str += backgroundPosition;
                    }
                }

                str += "}";

                newCssStr += str;
            });

            // 把原来的图片路径，替换成新的雪碧图片
            cssImgsPath.forEach(function(p){
                newCssStr = newCssStr.replace(new RegExp(p, 'g'), newCssFileImgSrc);
            });


            // 生成新的css文件
            fs.writeFileSync(path.join(cssTo, cssFileName), newCssStr);

            callback && callback();
        }

        // 如果是使用普通布局
        if( typeof opt.type === 'string' ){
            normalForp({
                space: space,
                type: opt.type
            }, sizes, function(nice){
                createOutImageAndCss(nice);
            });

            return;
        }

        // 使用最紧密算法布局
        forp({
            space: space,
            sampleMax: sampleMax
        }, sizes, function(nice) {
            createOutImageAndCss(nice);
        });
    });

}


psprites.run = run;

module.exports = psprites;
