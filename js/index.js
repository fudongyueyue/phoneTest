/** 
 * zepto 和 jQuery的区别？
 *   zepto专门为移动端开发准备的，所以没有考虑PC端IE的兼容问题，所以zepto要比jQuery小的多；而且还有一方面，也导致了zepto比jQuery小：zepto只实现了jQuery中最常用的方法（例如slideDown/slideUp/slideToggle等快捷动画，在zepto中都没有）；
 *   1.JQ中设置样式和实现动画的时候，不支持css3中某些样式属性的设置，例如：transform，但是ZP中支持了这样的处理
 *   2.ZP中单独提供了一些移动端常用的事件方法：tap/singleTap/doubleTap/longTap/swipe/swipeLeft/swipeRight/swipeUp/swipeDown/pinchIn/pinchOut...,而这些JQ中都没有
 * 
 * 移动端能用click事件行为吗？
 *   PC端click是点击事件，移动端的click是单击事件（所以在移动端使用click会存在300ms延迟的问题，在第一次触发后，会等待300ms,看是否有第二次触发，存在则为双击，不存在才是单击） =>移动端的所有操作基本上都是基于touch/gesture事件模型模拟出来的
 * 
 * 移动端常用的事件库
 * - zepto
 * - fastclick：解决移动端click的300ms延迟问题的
 * - hammerjs：国际通用的移动端手势事件库
 */

// $(document.body).tap(function(e) {
//     console.log('ZP:点击事件~');
// });

/*
document.body.addEventListener('touchstart', function(e) {
    //=>e:TouchEvent
    //touches vs changedTouches:存储每根手指的操作信息（它是一个集合，对于touch单手指事件来说，集合中只有一项），changedTouches存储的是手指发生改变操作的信息，但是最开始按下的时候和touches一样的，但是它可以在手机离开的事件中获取到手指离开瞬间的信息，而touches在离开的时候则没有，真实项目中一般用changedTouches
    let point = e.changedTouches[0];
    this.startX = point.clientX;
    this.startY = point.clientY;
    this.isMove = false;
});

document.body.addEventListener('touchmove', function(e) {
    let point = e.changedTouches[0],
        changeX = point.clientX - this.startX,
        changeY = point.clientY - this.startY;
    if (Math.abs(changeX >= 30) || Math.abs(changeY >= 30)) {
        this.isMove = true;
    }
});

document.body.addEventListener('touchend', function(e) {
    if (this.isMove) {
        console.log('触发了移动事件~');
        return;
    }
    console.log('触发了点击事件~');
});
*/

/* 在移动端处理滑屏事件的时候，我们要把文档滑动的默认行为禁止掉 */
['touchmove', 'touchend'].forEach(function(item) {
    document.addEventListener(item, function(e) {
        e.preventDefault();
    }, { passive: false });
});



/* ==魔方模块== */
let cubeMoudle = (function() {
    let $cubeBox = $('.cubeBox'),
        $cube = $cubeBox.children('.cube');
    //记录手指的起始坐标和盒子的起始旋转角度
    function down(e) {
        let point = e.changedTouches[0];
        this.startX = point.clientX;
        this.startY = point.clientY;
        if (!this.rotateX) {
            //=>第一次按下设置初始值，以后再按下，按照上次旋转后的角度发生移动即可
            this.rotateX = -30;
            this.rotateY = 45;
        }
        this.isMove = false;
    };
    //=>记录手指在X/Y轴偏移的值，计算出是否发生移动
    function move(e) {
        let point = e.changedTouches[0];
        this.changeX = point.clientX - this.startX;
        this.changeY = point.clientY - this.startY;
        if (Math.abs(this.changeX) >= 10 || Math.abs(this.changeY) >= 10) {
            this.isMove = true;
        };
    };
    //=>如果发生过移动，我们让盒子在原始的旋转角度上继续旋转
    //changeX控制的是Y轴旋转的角度，changeY控制的是X轴旋转角度，并且changeY的值和沿着X轴旋转角度的值正好相反（例如：向上移动，changeY为负，按照X轴向上旋转却是正的角度）
    function up(e) {
        let point = e.changedTouches[0],
            $this = $(this);
        if (!this.isMove) return;
        this.rotateX = this.rotateX - this.changeY / 3;
        this.rotateY = this.rotateY + this.changeX / 3;
        $this.css(`transform`, `scale(.8) rotateX(${this.rotateX}deg) rotateY(${this.rotateY}deg)`);
    };

    return {
        init(isInit) {
            $cubeBox.css('display', 'block');
            if (isInit) return;
            $cube.css('transform', 'scale(.8) rotateX(-30deg) rotateY(45deg)').on('touchstart', down).on('touchmove', move).on('touchend', up);

            $cube.children('li').tap(function(e) {
                $cubeBox.css('display', 'none');
                swiperMoudle.init($(this).index() + 1);
            });
        }
    }
})();

/* ==滑屏模块== */
let swiperMoudle = (function() {
    let swiperExample = null,
        $baseInfo = null,
        $swiperBox = $('.swiperBox'),
        $returnBox = $('.returnBox');

    function pageMove() {
        $baseInfo = $('.baseInfo');
        //=>this:swiperExample
        let activeIndex = this.activeIndex,
            slides = this.slides;

        //=>第一页3D折叠菜单的处理
        if (activeIndex === 1 || activeIndex === 7) {
            //=>makisu的基础配置
            $baseInfo.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 0.8
            });
            $baseInfo.makisu('open');
        } else {
            $baseInfo.makisu({
                selector: 'dd',
                overlap: 0,
                speed: 0
            });
            $baseInfo.makisu('close')
        };

        //=>给当前页面设置ID，让其内容有动画效果
        [].forEach.call(slides, (item, index) => {
            if (index === activeIndex) {
                activeIndex === 0 ? activeIndex = 6 : null;
                activeIndex === 7 ? activeIndex = 1 : null;
                item.id = 'page' + activeIndex;
                return;
            }
            item.id = null;
        });
    };

    return {
        init(index = 1) {
            $swiperBox.css('display', 'block');
            if (swiperExample) {
                swiperExample.slideTo(index, 0);
                return;
            }
            swiperExample = new Swiper('.swiper-container', {
                direction: 'horizontal',
                loop: true,
                effect: "coverflow", //（普通位移切换），"fade"（淡入）、"cube"（方块）、"coverflow"（3d流）、"flip"（3d翻转）、"cards"(卡片式)、"creative"（创意性）
                on: {
                    init: pageMove,
                    transitionEnd: pageMove
                }
            });
            swiperExample.slideTo(index, 0);

            //=>点击返回按钮
            $returnBox.tap(function() {
                $swiperBox.css('display', 'none');
                cubeMoudle.init(true);
            });
        }
    }
})();

cubeMoudle.init();
// swiperMoudle.init(2);

/* ==音乐处理== */
function handleMusic() {
    let $musicAudio = $('.musicAudio'),
        musicAudio = $musicAudio[0],
        $musicIcon = $('.musicIcon');
    musicAudio.load();
    musicAudio.addEventListener('canplay', function() {
        // console.log(1);
        $musicIcon.css('display', 'block') //.addClass('move');
    });

    $musicIcon.tap(function() {
        if (musicAudio.paused) {
            //=>当前暂停状态
            play();
            $musicIcon.addClass('move');
            return;
        }
        //=>当前播放状态
        musicAudio.pause();
        $musicIcon.removeClass('move');
    });

    function play() {
        // musicAudio.play();
        setTimeout(function() {
            musicAudio.play();
            $musicIcon.addClass('move');
            document.removeEventListener('touchstart', play);
        }, 200);
    }
    // play();

    //=>兼容处理
    document.addEventListener('WeixinJSBridgeReady', play);
    document.addEventListener('YixinJSBridgeReady', play);
    document.addEventListener('touchstart', play);
}
setTimeout(handleMusic, 1000);
// let $musicAudio = $('.musicAudio'),
//     musicAudio = $musicAudio[0],
//     $musicIcon = $('.musicIcon');

// document.addEventListener('touchstart', function() {
//     console.log(musicAudio);
//     musicAudio.play();
// });