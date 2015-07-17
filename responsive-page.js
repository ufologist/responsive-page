/**
 * 让你的页面轻松适配各种移动设备和PC端浏览器.
 * 
 * @version 1.0.0 2015-7-16
 * @author Sun http://github.com/ufologist/responsive-page
 * @license MIT https://github.com/ufologist/responsive-page/blob/master/LICENSE
 */
(function(global) {
    // 工具方法
    // -------------------------------
    var browser = {
        css3: (function() {
            var div = global.document.createElement("div");
            var vendors = ['', 'webkit', 'moz', 'ms'];
            var stylePropertyMap = {
                Transform: 'transform'//, // 如果还需要判断其他的CSS3厂商属性可以在这里追加
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
            options[opt] = (typeof options[opt] != 'undefined') ? options[opt] : defaultOptions[opt];
        }
        return options;
    }


    // lib逻辑
    // -------------------------------
    var TRANSFORM = browser.css3.Transform;
    var DEFAULT_OPTIONS = {
        selector: '.mod-responsive',
        sliceWidth: 640,
        center: true
    };

    function wrapIt(element) {
        var parentEl = element.parentElement;
        // 如果是body下面的元素, 需要包一下, 便于计算总高度, 并避免最底部内容溢出(因为缩放造成的内容溢出)
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

        // XXX 这里获取原本的 position 其实没有意义
        var originPosition = element.style.position;
        var documentWidth = global.document.documentElement.clientWidth;

        // 为了计算容器仅包含内容时的宽度
        element.style.position = 'absolute';
        var contentWidth = element.clientWidth;
        element.style.position = originPosition;

        // 计算缩放比率
        var scaleX = documentWidth / contentWidth;
        // 如果大于窗口宽度大于切片了, 那么我们直接以切片为单位来缩放
        if (scaleX > 1) {
            scaleX = documentWidth / sliceWidth;
        }

        element.style[TRANSFORM + 'Origin'] = '0 0';
        element.style[TRANSFORM] = 'scale(' + scaleX + ')';
        // 直接固定为切片的宽度, 这样才能解决定位元素的样式问题.
        // 因为如果不固定这个宽度, 在缩放时由于宽度变小, 会造成定位元素出现换行问题, 样式就不统一了!
        // 还需要注意元素的padding, border影响盒模型的宽度, 可以通过设置 box-sizing: border-box 来避免这个问题
        element.style.width = sliceWidth + 'px';
        // 设置了元素的宽度后元素的高度会变大一点点, 因此这里重新获取高度, 否则会有部分内容被遮挡
        element.style.height = (element.clientHeight * scaleX) + 'px';
    }

    // 通过media query来判断窗口宽度小于切片宽度时才需要适配,
    // 大于切片大小后, 就可以让内容居中显示
    // 例如: 窗口宽度为320时小于640的切片大小, 因此我们通过缩放来实现适配
    function isGreaterThanSliceWidth(sliceWidth) {
        return global.matchMedia ? global.matchMedia('(min-width: ' + sliceWidth + 'px)').matches : undefined;
    }

    // 对外接口
    // -------------------------------
    /**
     * responsivePage
     * 
     * @param  {object} options {
     *                              selector {string} 内容区域的父级元素,接受任何合法的CSS选择器,默认为: .mod-responsive
     *                              sliceWidth {number} 切片宽度(单位是px), 默认为: 640
     *                              center {boolean} 页面宽度超过切片宽度后,是否不再适配宽度居中显示在页面中,默认为: true
     *                          }
     */
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