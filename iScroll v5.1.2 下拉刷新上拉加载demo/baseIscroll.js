
baseIscroll = function(obj){
	var _this = this;
	_this.pageSize = 10;
	_this.pullDownEl = null;
	_this.pullUpEl = null;
	_this.wrapperId = null;
	_this.ulEl = null;
	_this.initData = null;
	for (i in obj) _this[i] = obj[i];
	
	_this.pullActionDetect = {
		count:0,
		limit:10,
		check:function(count) {
			if (count) {
				_this.pullActionDetect.count = 0;
			}
			setTimeout(function() {
				if (_this.myScroll.y <= (_this.myScroll.maxScrollY + 100) && _this.pullUpEl && !_this.pullUpEl.className.match('loading')) {
					$(_this.pullUpEl).addClass('loading').html('<span class="pullUpIcon">&nbsp;</span><span class="pullUpLabel">Loading...</span>');
					_this.pullUpAction();
				} else if (_this.pullActionDetect.count < _this.pullActionDetect.limit) {
					_this.pullActionDetect.check();
					_this.pullActionDetect.count++;
				}
			}, 200);
		}
	}
	
	
	_this.load_content();
}

baseIscroll.prototype = {
		loadingShowTime : 500,	//加载中显示时间（毫秒）
		myScroll : null,
		pullDownOffset : 0,
		pullUpOffset : 0,
		load_content : function(refresh, next_page) {
			var _this = this;
			console.log(refresh, next_page);
			//1.从此处定时，则是先显示“加载中”，然后才发请求加载数据，从2处定时，则是发请求的同时，显示“加载中”
//			setTimeout(function() { 
				if (!refresh) {
					_this.initData();
					// Loading the initial content
				} else if (refresh && !next_page) {
					// Refreshing the content
					$(_this.ulEl).html('');
					_this.initData();
				} else if (refresh && next_page) {
					// 加载下一页
					_this.initData(next_page);
				}
			//2. “加载中”显示的定时时间
			setTimeout(function() { 
				
				if (refresh) {
					
					_this.myScroll.refresh();
					_this.pullActionCallback();
					
				} else {
					
					if (_this.myScroll) {
						_this.myScroll.destroy();
						$(_this.myScroll.scroller).attr('style', ''); // Required since the styles applied by IScroll might conflict with transitions of parent layers.
						_this.myScroll = null;
					}
					_this.trigger_myScroll();
					
				}
			}, _this.loadingShowTime);
			
		},
		pullDownAction : function () {
			var _this = this;
			_this.load_content('refresh');
			$(_this.ulEl).data('page', 1);
			
			$('#'+_this.wrapperId+' > .scroller').css({top:0});
			
		},
		pullUpAction : function (callback) {
			var _this = this;
			if ($(_this.ulEl).data('page')) {
				var next_page = parseInt($(_this.ulEl).data('page'), 10) + 1;
			} else {
				var next_page = 2;
			}
			_this.load_content('refresh', next_page);
			$(_this.ulEl).data('page', next_page);
			
			if (callback) {
				callback();
			}
		},
		pullActionCallback : function () {
			var _this = this;
			if (_this.pullDownEl && _this.pullDownEl.className.match('loading')) {
				
				_this.pullDownEl.className = 'pullDown';
				_this.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh';
				
				_this.myScroll.scrollTo(0, parseInt(_this.pullUpOffset)*(-1), 200);
				
			} else if (_this.pullUpEl && _this.pullUpEl.className.match('loading')) {
				
				$(_this.pullUpEl).removeClass('loading').html('');
				
			}
		},
		trigger_myScroll : function (offset) {
			var _this = this;
//			_this.pullDownEl = document.querySelector('#wrapper .pullDown');
			if (_this.pullDownEl) {
				_this.pullDownOffset = _this.pullDownEl.offsetHeight;
			} else {
				_this.pullDownOffset = 0;
			}
//			_this.pullUpEl = document.querySelector('#wrapper .pullUp');	
			if (_this.pullUpEl) {
				_this.pullUpOffset = _this.pullUpEl.offsetHeight;
			} else {
				_this.pullUpOffset = 0;
			}
			
			if ($(_this.ulEl).children('li').length < _this.pageSize) {
				// 内容不足一页，隐藏上拉，下拉div
				$(_this.pullDownEl).hide();
				$($(_this.pullUpEl).find('span')).hide();
				offset = 0;
			} else if (!offset) {
				// If we have more than 1 page of results and offset is not manually defined - we set it to be the pullUpOffset.
				offset = _this.pullUpOffset;
			}
			
			_this.myScroll = new IScroll('#'+_this.wrapperId, {
				/*
			probeType属性需要使用 iscroll-probe.js 才能生效
				probeType ： 1   滚动不繁忙的时候触发
				probeType ： 2   滚动时每隔一定时间触发
				probeType ： 3   每滚动一像素触发一次
				 */
				probeType : 1,	
				tap : true,
				click : false,
				preventDefaultException : {
					tagName : /.*/
				},	//列出哪些元素不屏蔽默认事件
				mouseWheel : false,	//是否开启鼠标滚轮
				scrollbars : true,	//右侧是否显示滚动条
				fadeScrollbars : false,	//是否渐隐滚动条，关掉可以加速
				interactiveScrollbars : false,	//用户是否可以拖动滚动条
				keyBindings : false,	//监听按键事件控制
				deceleration : 0.0002,	//滚动动量减速越大越快，建议不大于 0.01,默认0.0006
				startY : (parseInt(offset) * (-1))
			});
			
			_this.myScroll.on('scroll',function() {
				if ($(_this.ulEl).children('li').length >= _this.pageSize) {
					if (this.y >= 5 && _this.pullDownEl && !_this.pullDownEl.className.match('flip')) {
						_this.pullDownEl.className = 'pullDown flip';
						_this.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh';
						this.minScrollY = 0;
					} else if (this.y <= 5 && _this.pullDownEl && _this.pullDownEl.className.match('flip')) {
						_this.pullDownEl.className = 'pullDown';
						_this.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh';
						this.minScrollY = -_this.pullDownOffset;
					}
					console.log('this.y='+this.y+',this.minScrollY='+this.minScrollY+',_this.myScroll.maxScrollY='+_this.myScroll.maxScrollY);
					//下拉加载
					_this.pullActionDetect.check(0);
					
				}
			});
			_this.myScroll.on('scrollEnd',function() {
				console.log('scroll ended');
				if ($(_this.ulEl).children('li').length >= _this.pageSize) {
					console.log('scroll ended in ----');
					if (_this.pullDownEl && _this.pullDownEl.className.match('flip')) {
						console.log('scroll ended in  flip ----');
						_this.pullDownEl.className = 'pullDown loading';
						_this.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';
						_this.pullDownAction();
					}
					// 如果数据内容超过一页，并且滚动到页面底部，则加载下一页（上拉加载）
					_this.pullActionDetect.check(0);
				}
			});
			
			// 为了阻止页面刷新后会“闪现”滚动条，先将wrapper设置为left:-9999,在此重置wrapper中left:0
			setTimeout(function() {
				$('#'+_this.wrapperId).css({left : 0});
			}, 100);
		}
		
}	

