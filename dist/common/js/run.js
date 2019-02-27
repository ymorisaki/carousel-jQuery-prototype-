(function (win, $, CAROUSEL) {
    'use strict';

    const $win = $(win);
    const TRANSITIONEND = 'transitionend';
    const FOCUSABLE = 'a, area, input, button, select, option, textarea, output, summary, video, audio, object, embed, iframe';
    const setOptions = function (target, options) {
        let o;

        if (options) {
            for (o in options) {
                if (options.hasOwnProperty(o)) {
                    target[o] = options[o];
                }
            }
        }
    };

    // 機能実行
    $(function () {
        $('.js-carousel.fade').setCarousel({
            animationType: 'fade',
            duration: 600,
            playInterval: 2500,
            autoPlay: true
        });
        $('.js-carousel.col1').setCarousel({
            animationType: 'slide',
            duration: 600,
            playInterval: 5000,
            column: 1,
            spColumn: 2,
            autoPlay: true
        });
        $('.js-carousel.col2').setCarousel({
            animationType: 'slide',
            duration: 600,
            playInterval: 4000,
            column: 2,
            spColumn: 1,
            autoPlay: true,
            // onStopPlay: true,
            colMargin: 20,
            swipe: false,
        });
        $('.js-carousel.col3').setCarousel({
            animationType: 'slide',
            duration: 600,
            playInterval: 2000,
            column: 3,
            spColumn: 2,
            colMargin: 15,
            autoPlay: true
        });
    });

    /**
     * カルーセル
     * @param {object} $root - ルートとなる要素
     * @param {object} o - $.fn.setCarousel 内で設定した options
     * @constructor
     */
    CAROUSEL.Carousel = function ($root, o) {
        setOptions(this, o);
        this.$root = $root,
        this.nowPosition = 0;
        this.isCurrentNum = 1;
        this.isSliding = false;
    };

    CAROUSEL.Carousel.prototype = {
        init: function () {
            this.setInitItems();
            this.setController();
            this.changeTabindex();
            this.resizeHandler();
            this.clickHandler();
            this.hoverHandler();

            if (this.swipe === true) {
                this.swipeHandler();
            }

            if (this.autoPlay === true) {
                this.startAutoPlay();
            }

            if (this.animationType === 'fade') {
                this.column = 1;
            }
        },
        
        /**
         * カルーセルアイテムの初期配置
         * @return {void}
         */
        setInitItems: function () {
            let self = this;

            this.$wrap.css({
                position: 'absolute',
                top: 0
            });
            this.$item.css('position', 'absolute');

            if (this.itemLength === 1) {
                this.column = 1
            };

            if (this.animationType === 'slide') {
                this.cloneSlider();
                this.$slideInner.css({
                    transitionDuration: this.duration / 1000 + 's',
                    transitionTimingFunction: this.easing
                });
            }

            if (this.colMargin && this.column > 1) {
                this.$item.css('margin-right', this.colMargin + 'px');
            }

            if (this.animationType === 'fade') {
                this.$item.css({
                    top: 0,
                    left: 0,
                    opacity: 0,
                    transitionDuration: '0s',
                    transitionTimingFunction: this.easing
                });
                this.$item.eq(0).css('opacity', 1);

                setTimeout(function () {
                    self.$item.css('transition-duration', self.duration / 1000 + 's');
                }, 20);
            }
        },

        /**
         * カルーセルの複製
         * @return {void}
         */
        cloneSlider: function () {
            const $cloneElement1 = this.$wrap.clone();
            const $cloneElement2 = this.$wrap.clone();

            $cloneElement1.addClass('is-clone is-clone--after').appendTo(this.$slideInner);
            $cloneElement2.addClass('is-clone is-clone--before').prependTo(this.$slideInner);

            this.$cloneBeforeWrap = this.$root.find('.is-clone--before');
            this.$cloneBeforeItem = this.$cloneBeforeWrap.children();

            this.$cloneAfterWrap = this.$root.find('.is-clone--after');
            this.$cloneAfterItem = this.$cloneAfterWrap.children();

            this.$cloneAfterItem.attr('aria-hidden', true);
            this.$cloneBeforeItem.attr('aria-hidden', true);

            this.$cloneAfterItem.find(FOCUSABLE).attr('tabindex', -1);
            this.$cloneBeforeItem.find(FOCUSABLE).attr('tabindex', -1);
        },

        /**
         * スライド関連に必要な要素の配置
         * @return {void}
         */
        setController: function () {
            let indicatorHTML = '';
            let i = null;
            let maxLength = this.itemLength;

            for (i = 0; i < maxLength; i++) {
                indicatorHTML += '<li><button class="' + this.indicator + '" type="button"><span class="indicator-index" data-current="' + (i + 1) + '">' + (i + 1) + '番目のスライドを表示</span></button></li>';
            }

            this.$indicatorList = $(indicatorHTML);
            this.$next.appendTo(this.$root);
            this.$prev.prependTo(this.$root);
            this.$playerWrap.appendTo(this.$root);
            this.$indicatorWrap.appendTo(this.$playerWrap);
            this.$indicatorList.appendTo(this.$indicatorWrap);
            this.$indicator = this.$indicatorList.find('.carousel__indicator');
            this.$indicator[0].classList.add('-is-active');

            if (this.autoPlay === true) {
                this.$pause.appendTo(this.$playerWrap);
                this.isAutoPlay = true;
            }
        },

        /**
         * カルーセルアイテムのカラム割と横軸配置
         * 画面リサイズの度に処理を行う
         * @return {void}
         */
        setColItems: function () {
            let self = this;
            let i = null;
            let maxLength = this.itemLength;
            let deferred = new $.Deferred();

            if (this.isSliding) {
                return;
            }

            if (this.animationType === 'slide') {
                // カラムオプション変更とリサイズによるアイテム幅の計算
                if (this.column === 1) {
                    this.$item.css('width', '100%');
                    this.itemWidth = this.$item.outerWidth(true);
                    this.$cloneBeforeItem.css('width', '100%');
                    this.$cloneAfterItem.css('width', '100%');
                }

                if (this.column === 2) {
                    this.$item.css('width', 'calc(' +  (100 / this.column) + '% - ' + (this.colMargin / this.column) + 'px)');
                    this.$cloneBeforeItem.css('width', 'calc(' +  (100 / this.column) + '% - ' + (this.colMargin / this.column) + 'px)');
                    this.$cloneAfterItem.css('width', 'calc(' +  (100 / this.column) + '% - ' + (this.colMargin / this.column) + 'px)');
                    this.itemWidth = this.$item.outerWidth(true);
                }

                if (this.column === 3) {
                    this.$item.css('width', 'calc(' +  (100 / this.column) + '% - ' + (this.colMargin / this.column * 2) + 'px)');
                    this.$cloneBeforeItem.css('width', 'calc(' +  (100 / this.column) + '% - ' + (this.colMargin / this.column * 2) + 'px)');
                    this.$cloneAfterItem.css('width', 'calc(' +  (100 / this.column) + '% - ' + (this.colMargin / this.column * 2) + 'px)');
                    this.itemWidth = this.$item.outerWidth(true);
                }

                // クローンしたパネルの配置
                for (i = 0; i < maxLength; i++) {
                    this.$item.eq(i).css('left', this.itemWidth * i + 'px');
                    this.$cloneBeforeItem.eq(i).css('left', this.itemWidth * i + 'px');
                    this.$cloneAfterItem.eq(i).css('left', this.itemWidth * i + 'px');
                }

                // クローンしたパネルのラッパーを左右に配置
                this.$cloneBeforeWrap.css('left', '-' + this.itemWidth * this.itemLength + 'px');
                this.$cloneAfterWrap.css('left', this.itemWidth * this.itemLength + 'px');

                // スライド全体の再配置
                if (this.isCurrentNum !== 1) {
                    this.$slideInner.css({
                        left: '-' + (this.itemWidth * (this.isCurrentNum - 1)) + 'px',
                        transitionDuration: '0s'
                    });
                    this.nowPosition = parseInt(this.$slideInner.css('left').match(/(\d+)/)[0], 10);
                    deferred.resolve().promise().then(function () {
                        self.$slideInner.css('transition-duration', self.duration / 1000 + 's');
                    });
                }
            }
        },

        /**
         * 一つ先にスライドする処理
         * @return {void}
         */
        nextSlide: function () {
            if (this.isSliding) {
                return;
            }

            this.isSliding = true;
            this.isCurrentNum++;

            if (this.animationType === 'slide') {
                this.itemWidth = this.$item.outerWidth(true);
                this.$slideInner.css('left', '-' + (this.itemWidth + this.nowPosition) + 'px');

                // 無限ループ時にインジケーターを最初に戻す
                if (this.isCurrentNum === this.itemLength + 1) {
                    this.indicatorUpdate(0);
                    return;
                }
            }

            if (this.animationType === 'fade') {
                this.$item.eq(this.isCurrentNum - 2).css('opacity', 0);
                this.$item.eq(this.isCurrentNum - 1).css('opacity', 1);

                // 無限ループ時
                if (this.isCurrentNum === this.itemLength + 1) {
                    this.$item.eq(this.isCurrentNum - 1).css('opacity', 0);
                    this.$item.eq(0).css('opacity', 1);
                    this.indicatorUpdate(0);
                    this.isCurrentNum = 1;
                    return;
                }
            }

            // インジケーター同期
            this.indicatorUpdate(this.isCurrentNum - 1);
        },

        /**
         * 一つ先にスライドする処理（無限ループ切替時）
         * @return {void}
         */
        nextInfiniteLoop: function () {
            let self = this;

            if (this.animationType === 'slide') {
                this.$slideInner.css({
                    transitionDuration: '0s',
                });

                setTimeout(function () {
                self.$slideInner.css({
                    left: 0
                });
                }, 20);

                // 現在のカレントとleft位置を初期化
                this.isCurrentNum = 1;
                this.nowPosition = 0;

                setTimeout(function () {
                    self.$slideInner.css('transition-duration', self.duration / 1000 + 's');
                    self.isSliding = false;
                }, 40);
            }
        },

        /**
         * 一つ前にスライドする処理
         * @return {void}
         */
        prevSlide: function () {
            if (this.isSliding) {
                return;
            }

            this.isSliding = true;
            this.isCurrentNum--;

            if (this.animationType === 'slide') {
                this.itemWidth = this.$item.outerWidth(true);

                if (this.isCurrentNum === 0) {
                    this.$slideInner.css('left', (this.nowPosition + this.itemWidth) + 'px');
                } else if (this.isCurrentNum === 1) { 
                    this.$slideInner.css('left', 0);
                } else {
                    this.$slideInner.css('left', '-' + (this.nowPosition - this.itemWidth) + 'px');
                }
            }

            if (this.animationType === 'fade') {
                if (this.isCurrentNum === 0) {
                    this.$item.eq(0).css('opacity', 0);
                    this.$item.eq(this.itemLength - 1).css('opacity', 1);
                    this.isCurrentNum = this.itemLength;
                } else {
                    this.$item.eq(this.isCurrentNum).css('opacity', 0);
                    this.$item.eq(this.isCurrentNum - 1).css('opacity', 1);
                }
            }

            // インジケーター同期
            if (this.isCurrentNum === 0) {
                this.indicatorUpdate(this.itemLength - 1);
            } else {
                this.indicatorUpdate(this.isCurrentNum -1);
            }
        },

        /**
         * 一つ前にスライドする処理（無限ループ切替時）
         * @return {void}
         */
        prevInfiniteLoop: function () {
            let self = this;
            let deferred = new $.Deferred();
            this.itemWidth = this.$item.outerWidth(true);

            /* switch文だと上手く機能しないので取り合えずif分岐...orz */

            // 表示カラム数が1の場合
            if (this.column === 1) {
                // パーツの横幅 * (パーツの数 + (表示カラムオプション - 1)) 
                let targetPosition = this.itemWidth * (this.itemLength - (this.column));

                this.$slideInner.css({
                    transitionDuration: '0s',
                    left: '-' + targetPosition + 'px'
                });
            }

            // 表示カラム数が2の場合
            if (this.column === 2) {
                // パーツの横幅 * (パーツの数 + (表示カラムオプション - 1)) 
                let targetPosition = this.itemWidth * (this.itemLength - (this.column - 1));

                this.$slideInner.css({
                    transitionDuration: '0s',
                    left: '-' + targetPosition + 'px'
                });
            }

            // 表示カラム数が3の場合
            if (this.column === 3) {
                // パーツの横幅 * (パーツの数 + (表示カラムオプション - 1)) 
                let targetPosition = this.itemWidth * (this.itemLength - (this.column - 2));

                this.$slideInner.css({
                    transitionDuration: '0s',
                    left: '-' + targetPosition + 'px'
                });
            }

            // 現在のカレントとleft位置を初期化
            this.isCurrentNum = this.itemLength;
            this.nowPosition = parseInt(this.$slideInner.css('left').match(/(\d+)/)[0], 10);

            deferred.resolve().promise().then(function () {
                self.$slideInner.css('transition-duration', self.duration / 1000 + 's');
                self.isSliding = false;
            });
        },

        /**
         * 任意の箇所にスライドする処理
         * @param {object} .carousel__indicator クリックされたインジケーター
         * @return {void}
         */
        targetSlide: function (e) {
            let targetNum = $(e.target).find('.indicator-index').attr('data-current');

            if (this.isSliding) {
                return;
            }

            this.isSliding = true;

            this.indicatorUpdate(targetNum - 1);
            this.isCurrentNum = parseInt(targetNum, 10);

            if (this.animationType === 'slide') {
                this.$slideInner.css('left', '-' + this.itemWidth * (targetNum - 1) + 'px');
            }

            if (this.animationType === 'fade') {
                this.$item.css('opacity', 0);
                this.$item.eq(this.isCurrentNum - 1).css('opacity', 1);
            }
        },

        /**
         * スライド時のタブインデックス操作
         * @return {void}
         */
        changeTabindex: function () {
            let self = this;
            let setTabIndex = function (target, addNum) {
                self.$item.eq(target).find(FOCUSABLE).attr('tabindex', addNum);
            };
            let setCloneTabIndex = function (target, addNum) {
                self.$cloneAfterItem.eq(target).find(FOCUSABLE).attr('tabindex', addNum);
            };

            // タブインデックスをリセット
            this.$itemFocus.attr('tabindex', -1);

            if (this.animationType === 'slide') {
                this.$cloneAfterItem.find(FOCUSABLE).attr('tabindex', -1);
            }

            switch (this.column) {
                case 1:
                    if (this.isCurrentNum === this.itemLength + 1) {
                        setTabIndex(0, 0);
                        return;
                    }

                    if (this.isCurrentNum === 0) {
                        setTabIndex(this.itemLength - 1, 0);
                        return;
                    }

                    setTabIndex(this.isCurrentNum - 1, 0);
                    break;

                case 2:
                    // 最初のアイテムにカレント時
                    if (this.isCurrentNum === 0) {
                        setTabIndex(this.isCurrentNum - 1, 0);
                        setCloneTabIndex(0, 0);
                        return;
                    }

                    // 最後から二番目のアイテムにカレント時
                    if (this.isCurrentNum === this.itemLength) {
                        setTabIndex(this.isCurrentNum - 1, 0);
                        setCloneTabIndex(0, 0);
                        return;
                    }

                    // 最後のアイテムにカレント時
                    if (this.isCurrentNum === this.itemLength + 1) {
                        setTabIndex(0, 0);
                        setTabIndex(1, 0);
                        return;
                    }

                    setTabIndex(this.isCurrentNum - 1, 0);
                    setTabIndex(this.isCurrentNum, 0);
                    break;

                case 3:
                    // 最初のアイテムにカレント時
                    if (this.isCurrentNum === 0) {
                        setTabIndex(this.isCurrentNum - 1, 0);
                        setCloneTabIndex(0, 0);
                        setCloneTabIndex(1, 0);
                        return;
                    }

                    // 最後から三番目のアイテムにカレント時
                    if (this.isCurrentNum === this.itemLength - 1) {
                        setTabIndex(this.isCurrentNum, 0);
                        setTabIndex(this.isCurrentNum - 1, 0);
                        setCloneTabIndex(0, 0);
                        return;
                    }

                    // 最後から二番目のアイテムにカレント時
                    if (this.isCurrentNum === this.itemLength) {
                        setTabIndex(this.isCurrentNum - 1, 0);
                        setCloneTabIndex(0, 0);
                        setCloneTabIndex(1, 0);
                        return;
                    }

                    // 最後のアイテムにカレント時
                    if (this.isCurrentNum === this.itemLength + 1) {
                        setTabIndex(0, 0);
                        setTabIndex(1, 0);
                        setTabIndex(2, 0);
                        return;
                    }

                    setTabIndex(this.isCurrentNum - 1, 0);
                    setTabIndex(this.isCurrentNum, 0);
                    setTabIndex(this.isCurrentNum + 1, 0);
                    break;
            }
        },

        /**
         * マウスクリック時の処理
         * @return {void}
         */
        clickHandler: function () {
            let self = this;

            this.$next.on('click', function () {
                self.nextSlide();
                self.changeTabindex();
                self.resetAutoPlayTime();
            });

            this.$prev.on('click', function () {
                self.prevSlide();
                self.changeTabindex();
                self.resetAutoPlayTime();
            });

            this.$indicator.on('click', function (e) {
                if ($(e.target).hasClass('-is-active')) {
                    return;
                }
                self.targetSlide(e);
                self.changeTabindex();
                self.resetAutoPlayTime();
            });

            this.$slideInner.on(TRANSITIONEND, function () {
                self.transitionHandler();
            });

            this.$item.on(TRANSITIONEND, function () {
                self.isSliding = false;
            })

            this.$pause.on('click', function (e) {
                if (e.target.classList.contains('carousel__pause')) {
                    self.stopAutoPlay();
                } else {
                    self.startAutoPlay();
                }
                self.changeAutoPlayIcon(e);
            });
        },

        /**
         * マウスホバー時の処理
         * @return {void}
         */
        hoverHandler: function () {
            this.mouseOnStopAutoPlay();
        },

        /**
         * スワイプ時の処理
         * @return {void}
         */
        swipeHandler: function () {
            let self = this;
            let mouseOnX = null;
            let mouseOutX = null;
            let eventCansel = function (e) {
                e.preventDefault();
            };

            this.$slideInner.on('mousedown', function (e) {
                eventCansel(e);
                mouseOnX = e.pageX;
            });

            this.$slideInner.on('mouseup', function (e) {
                mouseOutX = e.pageX;

                if (mouseOnX < mouseOutX) {
                    self.$slideInner.on('click', eventCansel);
                    self.prevSlide();
                    self.changeTabindex();
                    self.resetAutoPlayTime();
                } else if (mouseOutX < mouseOnX) {
                    self.$slideInner.on('click', eventCansel);
                    self.nextSlide();
                    self.changeTabindex();
                    self.resetAutoPlayTime();
                } else {
                    self.$slideInner.off('click', eventCansel);
                }
            });
        },

        /**
         * トランジションアニメーション後に行う処理
         * @return {void}
         */
        transitionHandler: function () {
            if (this.animationType === 'slide') {
                this.nowPosition = parseInt(this.$slideInner.css('left').match(/(\d+)/)[0], 10); // 現在のleft位置を数値でキャッシュ
                this.setColItems();
                $win.trigger('resize');

                if (this.isCurrentNum > this.itemLength) {
                    this.nextInfiniteLoop();
                    return;
                }

                if (this.isCurrentNum === 0) {
                    this.prevInfiniteLoop();
                    return;
                }
                this.isSliding = false;
            }
        },

        /**
         * リサイズの際の処理
         * @return {void}
         */
        resizeHandler: function () {
            let self = this;
            let timeoutId = null;
            let windowWidth = null;

            $win.on('resize', function () {
                if (timeoutId) {
                    return;
                }

                timeoutId = setTimeout(function () {
                    timeoutId = 0;
                    windowWidth = $win.width();

                    if (self.spColumn) {
                        self.changeBreakPoint(windowWidth);
                    }

                    self.setColItems();
                    self.matchHeight();
                }, self.resizeThreshold);
            });
        },

        /**
         * ブレイクポイントのカラム切り替え処理
         * @return {void}
         */
        changeBreakPoint: function (width) {
            if (width < this.breakPoint) {
                this.column = this.spColumn;
                if (this.spColumn === 1) {
                    this.colMargin = 0;
                }
            } else {
                this.column = this.defaultColumn;
                this.colMargin = this.defaultMargin;
            }
        },

        /**
         * インジケーターのカレント同期
         * @param {Number} カレントをアクティブにしたい数値
         * @return {void}
         */
        indicatorUpdate: function (currentTarget) {
            this.$indicator.removeClass('-is-active');
            this.$indicator.eq(currentTarget).addClass('-is-active');
        },

        /**
         * 自動再生開始機能
         * @return {void}
         */
        startAutoPlay: function () {
            let self = this;

            this.isAutoPlay = true;
            this.autoPlayId = setInterval(function () {
                self.nextSlide();
                self.changeTabindex();
            }, this.playInterval);
        },

        /**
         * 自動再生停止機能
         * @return {void}
         */
        stopAutoPlay: function () {
            this.isAutoPlay = false;
            clearInterval(this.autoPlayId);
        },

        /**
         * 自動再生タイミングリセット機能
         * @return {void}
         */
        resetAutoPlayTime: function () {
            if (this.autoPlay === true && this.isAutoPlay === true) {
                let deferred = new $.Deferred();
                this.stopAutoPlay();
                deferred.resolve().promise().then(this.startAutoPlay());
            }
        },

        /**
         * マウスホバー時の自動再生切替機能
         * @return {void}
         */
        mouseOnStopAutoPlay: function () {
            if (this.autoPlay === true && this.isAutoPlay === true && this.onStopPlay === true) {
                let self = this;
                this.$item.mouseenter(function () {
                    self.stopAutoPlay();
                });
                this.$item.mouseleave(function () {
                    self.startAutoPlay();
                });
            }
        },

        /**
         * 自動再生アイコンの変更処理
         * @return {void}
         */
        changeAutoPlayIcon: function (e) {
            let target = $(e.currentTarget);

            if (target.hasClass('carousel__pause')) {
                target.removeClass('carousel__pause');
                target.addClass('carousel__play');
                target.find('span').text('自動再生を開始');
            } else {
                target.removeClass('carousel__play');
                target.addClass('carousel__pause');
                target.find('span').text('自動再生を停止');
            }
        },

        /**
         * 高さ揃え
         * @return {void}
         */
        matchHeight: function () {
            let i = 0;
            let maxLength = this.itemLength;
            let heightAry = [];

            this.$wrap.css('height', '');
            this.$item.css('height', '');

            for (i = 0; i < maxLength; i++) {
                heightAry.push(this.$item.eq(i).height());
            }

            heightAry.sort(function (a, b) {
                if (a > b) {
                    return -1;
                }
                if (a < b) {
                    return 1;
                }
                return 0;
            });

            this.$slideInner.css('height', heightAry[0] + 'px');
            this.$item.css('height', heightAry[0] + 'px');

            if (this.animationType === 'slide') {
                this.$cloneBeforeWrap.css('height', heightAry[0] + 'px');
                this.$cloneBeforeItem.css('height', heightAry[0] + 'px');

                this.$cloneAfterWrap.css('height', heightAry[0] + 'px');
                this.$cloneAfterItem.css('height', heightAry[0] + 'px');
            }
        },

    };

    /*
     * カルーセルプラグイン
     */
    $.fn.setCarousel = function (options) {
        let o;

        if (!this.length) {
            return false;
        }

        o = $.extend({
            wrap: 'carousel__wrap',
            slideWrap: 'carousel__slide-wrap',
            slideInner: 'carousel__slide-inner',
            item: 'carousel__item',
            next: 'carousel__next',
            prev: 'carousel__prev',
            playerWrap: 'carousel__player-wrap',
            indicatorWrap: 'carousel__indicator-wrap',
            indicator: 'carousel__indicator',
            play: 'carousel__play',
            pause: 'carousel__pause',
            autoPlayHook: 'carousel__play-hook',
            animationType: 'slide',
            easing: 'ease',
            autoPlay: false,
            onStopPlay: false,
            swipe: true,
            column: 1,
            spColumn: null,
            dots: true,
            colMargin: null,
            breakPoint: 767,
            playInterval: 5000,
            resizeThreshold: 200,
            duration: 300,
        }, options);

        return this.each(function () {
            const $root = $(this);
            const $slideWrap = $root.find('.' + o.slideWrap);
            const $slideInner = $root.find('.' + o.slideInner);
            const $wrap = $root.find('.' + o.wrap);
            const $item = $root.find('.' + o.item);
            const itemLength = $item.length;
            const $itemFocus = $item.find(FOCUSABLE);
            const $next = $('<button class="' + o.next + '" type="button"><span></span></button>');
            const $prev = $('<button class="' + o.prev + '" type="button"><span></span></button>');
            const $playerWrap = $('<div class="' + o.playerWrap + '">');
            const $indicatorWrap = $('<ul class="' + o.indicatorWrap + '">');
            const indicator = o.indicator;
            const $play = $('<button class="' + o.play + ' ' + o.autoPlayHook + '" type="button"><span>自動再生を開始</span></button>');
            const $pause = $('<button class="' + o.pause + ' ' + o.autoPlayHook + '" type="button"><span>自動再生を停止</span></button>');
            const carousel = new CAROUSEL.Carousel($root, {
                $slideWrap: $slideWrap,
                $slideInner: $slideInner,
                $wrap: $wrap,
                $item: $item,
                itemLength: itemLength,
                $itemFocus: $itemFocus,
                $next: $next,
                $prev: $prev,
                $playerWrap: $playerWrap,
                $indicatorWrap: $indicatorWrap,
                indicator: indicator,
                $play: $play,
                $pause: $pause,
                column: o.column,
                defaultColumn: o.column,
                spColumn: o.spColumn,
                autoPlay: o.autoPlay,
                onStopPlay: o.onStopPlay,
                easing: o.easing,
                autoPlayId: null,
                dots: o.dots,
                isAutoPlay: false,
                swipe: o.swipe,
                breakPoint: o.breakPoint,
                animationType: o.animationType,
                colMargin: o.colMargin,
                defaultMargin: o.colMargin,
                resizeThreshold: o.resizeThreshold,
                duration: o.duration,
                playInterval: o.playInterval,
            });

            carousel.init();
            $win.trigger('resize');
        });
    };
}(window, window.jQuery, window.CAROUSEL || {}));
