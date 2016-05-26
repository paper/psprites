/**
 * Created by paper on 2016/5/26.
 *
 * 能够使图片 ->
 *   左对齐: top-down
 *   横对其: left-right
 *   斜对其: diagonal(左上到右下)
 * 
 * 上面的对其命名参考了：https://github.com/Ensighten/spritesmith
 */

/**
 * 基础布局算法
 * 
 * @param {opt} 配置
 *   opt.type 对其类型 'top-down', 'left-right', 'diagonal'
 *   默认 'top-down'
 *   
 *   opt.space 图片直接的间距
 *   默认 1
 * 
 * @param {Array} r 图片尺寸数组 [ [10,20], [23,45], ... ]
 * @param {Function} callback
 * @param {Object} nice callback 里面的参数
    nice = {
        w : w,   // 容器最小宽度
        h : h,   // 容器最小高度
        r : r,   // [ { w:160, h:160, p:0, x:10, y:20}, 
                      { w:128, h:128, p:50, x:13, y:21}, 
                      { w:50, h:50, p:9, x:33, y:12} ... ]
    }
 */
var normalAlgo = function(opt, r, callback){
    // 如果只传了 r 和 callback
    if( arguments.length === 2 ){
        callback = r;
        r = opt;
        opt = {};
    }

    // 图片之间的间隙
    var space = opt.space || 1;
    
    // 样本个数
    var type = opt.type || 'top-down';
    
    // 最终图片生成的宽度和高度
    var box_width = 0;
    var box_height = 0;
    
    var box = [];
    
    var x = 0;
    var y = 0;

    var prev_w = 0;
    var prev_h = 0;
    
    r.forEach(function(v, i){
        var w = v[0] + space;
        var h = v[1] + space;

        switch (type) {
            case 'top-down':
                if( w > box_width ){
                    box_width = w;
                }
                box_height += h;
                y = y + prev_h;
  
                box.push({
                    w: v[0], 
                    h: v[1], 
                    p: i,
                    x: 0,
                    y: y
                });
                break;
            
            case 'left-right':
                if( h > box_height ){
                    box_height = h;
                }
                box_width += w;
                x = x + prev_w;

                box.push({
                    w: v[0],
                    h: v[1],
                    p: i,
                    x: x,
                    y: 0
                });
                break;

            case 'diagonal':
                box_width  += w;
                box_height += h;
                x = x + prev_w;
                y = y + prev_h;

                box.push({
                    w: v[0],
                    h: v[1],
                    p: i,
                    x: x,
                    y: y
                });
                break;       
        }

        prev_w = w;
        prev_h = h;
    });
    
    callback && callback({
        w: box_width,
        h: box_height,
        r: box
    });
}

module.exports = normalAlgo;

