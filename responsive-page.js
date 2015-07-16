/**
 * 让你的页面轻松适配各种移动设备和PC端浏览器.
 * 
 * @version 1.0.0 2015-7-16
 * @author Sun http://github.com/ufologist/responsive-page
 */
(function(global) {
    // 工具方法
    // -------------------------------
    var browser = {
        css3: (function() {
            var div = document.createElement("div");
            var vendors = ['', 'webkit', 'moz', 'ms'];
            var stylePropertyMap = {
                Transform: 'transform',
                BoxSizing: 'box-sizing'//, // 如果还需要别的CSS3厂商属性可以追加
                // Transition: 'transition',
                // Animation: 'animation'
            };

            for (var property in stylePropertyMap) {
                for (var i = 0, length = vendors.length; i < length; i++) {
                    var vendor = vendors[i];
                    var stylePropertyName = vendor ? vendor + property : stylePropertyMap[property];

                    if (stylePropertyName in div.style) {
                        stylePropertyMap[property] = stylePropertyName;
                        break;
                    }
                }
            }

            return stylePropertyMap;
        })()
    };
    function extendDefault(options, defaultOptions) {
        for (var opt in defaultOptions) {
            options[opt] = options[opt] ? options[opt] : defaultOptions[opt];
        }
        return options;
    }


    // lib逻辑
    // -------------------------------
    var TRANSFORM = browser.css3.Transform;
    var BOX_SIZING = browser.css3.BoxSizing;
    var DEFAULT_OPTIONS = {
        selector: '.mod-responsive',
        sliceWidth: 640,
        center: true
    };

    function wrapIt(element) {
        var parentEl = element.parentElement;
        // 如果是body下面的元素, 需要包一下, 便于计算总高度
        if (parentEl == global.document.body) {
            var wrapperEl = document.createElement('div');
            wrapperEl.style.overflow = 'hidden';
            wrapperEl.appendChild(element);
            parentEl.appendChild(wrapperEl);
        } else if (parentEl.style.overflow != 'hidden') {
            parentEl.style.overflow = 'hidden';
        }
    }

    function responsiveIt(element, options) {
        var sliceWidth = options.sliceWidth;
        var greaterThanSliceWidth = isGreaterThanSliceWidth(sliceWidth);

        // XXX 这里有点太霸道了不?
        if (element.getAttribute('style') !== null) {
            element.removeAttribute('style');
        }

        // 如果页面宽度已经大于切片了, 那么可以配置为居中显示, 就不适配宽度了
        if (options.center && greaterThanSliceWidth) {
            element.style.width = sliceWidth + 'px';
            element.style.marginLeft = 'auto';
            element.style.marginRight = 'auto';
            return;
        }

        // 为了计算宽度
        element.style.position = 'absolute';
        var originWidth = element.clientWidth;
        element.style.position = 'static';

        var scaleX = element.parentElement.clientWidth / originWidth;
        if (scaleX > 1) {
            scaleX = element.parentElement.clientWidth / sliceWidth;
        }
        var height = element.parentElement.clientHeight * scaleX;

        element.style[TRANSFORM + 'Origin'] = '0 0';
        element.style[TRANSFORM] = 'scale(' + scaleX + ')';
        element.style.height = height + 'px';

        fixChildrenWidth(element, sliceWidth);
    }

    // 直接子元素固定为切片的宽度, 这样才能解决定位元素的样式问题.
    // 因为如果不固定这个宽度, 在缩放时由于宽度变小, 会造成定位元素出现换行问题, 样式就不统一了!
    // 还需要注意元素的padding, border影响宽度的盒模型
    function fixChildrenWidth(element, sliceWidth) {
        var childrenEls = element.children;
        for (var i = 0, length = childrenEls.length; i < length; i++) {
            // 需要注意元素如果有 padding 或者 border 会造成宽度超出!
            // 如果元素的内容有溢出(例如内容宽度超过640时), 则会造成溢出部分不会自动换行,
            // 且内容因为 overflow:hidden 而被隐藏了, 请参考demo中很长内容的那个部分来反应这个问题
            // 因此需要设置为新的盒模型!
            var childrenEl = childrenEls[i];
            if (childrenEl.style[BOX_SIZING] != 'border-box') {
                childrenEl.style[BOX_SIZING] = 'border-box';
            }
            childrenEl.style.width = sliceWidth + 'px';
        }
    }

    // 通过media query来判断窗口宽度小于切片宽度时才需要适配,
    // 大于切片大小后, 就可以让内容居中显示
    // 例如: 窗口宽度为320, 小于640的切片大小, 因此我们通过缩放来实现适配
    function isGreaterThanSliceWidth(sliceWidth) {
        return global.matchMedia ? global.matchMedia('(min-width: ' + sliceWidth + 'px)').matches : undefined;
    }

    // 对外接口
    // -------------------------------
    global.responsivePage = function(options) {
        extendDefault(options, DEFAULT_OPTIONS);

        var containerEls = global.document.querySelectorAll(options.selector);
        for (var i = 0, length = containerEls.length; i < length; i++) {
            var element = containerEls[i];
            wrapIt(element);
            responsiveIt(element, options);
        }
    };
})(window);