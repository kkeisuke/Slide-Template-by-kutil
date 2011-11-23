/**
 * @fileoverview スライド
 */

(function (win){
	
	if(kutil == undefined) { return; }
	
	// ユーティリティ インスタンス
	var handler = kutil.createHandler();
	var classUtil = kutil.createClassUtil();
	var cssUtil = kutil.createCSSUtil();
	
	
	function SlideControl (obj){
		
		this.speed = 700;
		this._index = new Index();
		this._sliders = this._createSlide(SlideControl.SLIDE);
		this._current = 0;
		this._isChanging = false;
		this._title = "";
		this._extends(obj);
		this._init();
	}
	
	SlideControl.SLIDE = "Slide";
	SlideControl.IS_IE = navigator.userAgent.search(/MSIE (6|7)/) != -1 ? true : false;
	SlideControl.R_ARROW = 39;
	SlideControl.L_ARROW = 37;
	SlideControl.U_ARROW = 38;
	SlideControl.D_ARROW = 40;
	SlideControl.ONE = 49;
	
	SlideControl.prototype = {
		
		_extends:function(obj){
			
			if(obj == undefined) { return; }
			
			for(var param in obj){
				
				this[param] = obj[param];
			}
		},
		_init:function (){
			
			this._title = document.getElementsByTagName("title")[0].innerHTML;
			
			var body = document.body;
			body.style.position = "relative";
			body.style.overflow = "hidden";
			body.style.padding = 0;
			body.style.visibility = "hidden";
			var scope = this;
			
			// すぐには値が取得出来ないブラウザがあるので、遅延。
			var intervalID = win.setInterval(function(){
				
				if(body.offsetWidth != 0 && body.offsetHeight != 0){
					
					scope._setPositon();
					
					handler.add(win, "resize", function(){
						
						scope._setPositon();
					});
					
					win.clearInterval(intervalID);
					
					body.style.visibility = "visible";
				}
				
			}, 20);
			
			this._setEvents();
			this._setPage();
			this._index.createIndex();
		},
		_setEvents:function(){
			
			var scope = this;
			
			handler.add(document, "keydown", function(e){
				
				if(!scope._isChanging){
						
					// IE6対策
					var keyCode = e.keyCode == undefined ? 0: e.keyCode;
					// 足した値で判断
					var flag = e.charCode + keyCode;
					
					var rArrow = SlideControl.R_ARROW;
					var lArrow = SlideControl.L_ARROW;
					var one = SlideControl.ONE;
					
					if(e.ctrlKey){
						
						switch(flag) {
							
							case rArrow:
								
								scope.slideNext();
								break;
							case lArrow:
								
								scope.slidePre();
								break;
						}
						
					}else{
						
						switch(flag) {
							
							case rArrow:
								
								scope._sliders[scope._current].animates();
								break;
							case lArrow:
								
								scope._sliders[scope._current].resets();
								break;
							case one:
							
								scope._index.toggleIndex();
								break;
						}
					}	
				}
			});
			
			if("onhashchange" in win){
				
				handler.add(win, "hashchange", function(){
					
					if(!scope._isChanging){
						
						scope._setPage();
						scope._setPositon();
					}
				});
				
			}else{
				
				// setInterval で監視。jQuery hashchange event も同じような実装
				var lastHash = location.hash;
				win.setInterval(function(){
					
					if(!scope._isChanging && location.hash != lastHash){
						
						scope._setPage();
						scope._setPositon();
						
						lastHash = location.hash;
					}
					
				}, 50);
			}
		},
		_createSlide:function (className){
			
			var slidNodes = classUtil.getElementsByClassName(className);
			
			var num = slidNodes.length;
			var sliders = [];
			var slidNode;
			for (var i=0; i<num; i++) {
				
				slidNode = slidNodes[i];
				sliders[i] = new Slide(slidNode, i);
				this._index.insertIndex(slidNode, i+1);
			}
			
			return sliders;
		},
		_setPage:function(){
			
			var page = location.hash;
			
			if(page.indexOf("#") == 0){
				
				var pageNum = page.replace("#","");
				
				if(!isNaN(pageNum) && pageNum >= 1 && pageNum <= this._sliders.length){
					
					this._current = pageNum - 1;
					
				}else{
					
					this._current = 0;
				}
				
			}else{
				
				this._current = 0;
			}
			
			document.getElementsByTagName("title")[0].innerHTML = this._title + " " + (this._current+1) + " page";
		},
		_setPositon:function (){
			
			var w = document.body.offsetWidth;
			var h = document.body.offsetHeight;
			
			var num = this._sliders.length;
			var targetSlide;
			for (var i=0; i<num; i++) {
				
				targetSlide = this._sliders[i].node;
				targetSlide.style.top = (h - targetSlide.offsetHeight)*0.5 + "px";
				
				if(i == this._current){
					
					targetSlide.style.left = (w - targetSlide.offsetWidth)*0.5 + "px";
					
				}else{
					
					targetSlide.style.left = w + "px";
				}
			}
		},
		slideNext:function (){
			
			this._isChanging = true;
			
			var num = this._sliders.length - 1;
			
			if(num > 0){
				
				var next = this._current + 1;
				
				if(next > num){
					
					next = 0;
				}
				
				var target = this._sliders[this._current].node;
				var nextTarget = this._sliders[next].node;
				
				var center = target.style.left;
				
				var a1 = kutil.createCSSAnimator();
				a1.addAnimation(target, {left:-target.offsetWidth+"px"}, this.speed, 0, "easeOutCubic", callback);
				
				var a2 = kutil.createCSSAnimator();
				nextTarget.style.left = document.body.offsetWidth + "px";
				a2.addAnimation(nextTarget, {left:center}, this.speed, 0, "easeOutCubic");
			}
			
			var scope = this;
			
			function callback(){
				
				if(scope._current < num){
					
					scope._current++
					
				}else{
					
					scope._current = 0;
				}
				
				scope._isChanging = false;
				location.hash = "#" + (scope._current + 1);
			}
		},
		slidePre:function (){
			
			this._isChanging = true;
			
			var num = this._sliders.length - 1;
			
			if(num > 0){
				
				var pre = this._current - 1;
				
				if(pre < 0){
					
					pre = num;
				}
				
				var target = this._sliders[this._current].node;
				var preTaregt = this._sliders[pre].node;
				
				var center = target.style.left;
				
				var a1 = kutil.createCSSAnimator();
				a1.addAnimation(target, {left:document.body.offsetWidth+"px"}, this.speed, 0, "easeOutCubic", callback);
				
				var a2 = kutil.createCSSAnimator();
				preTaregt.style.left = - preTaregt.offsetWidth + "px";
				a2.addAnimation(preTaregt, {left:center}, this.speed, 0, "easeOutCubic");
			}
			
			var scope = this;
			
			function callback(){
				
				if(scope._current <= 0){
					
					scope._current = num;
					
				}else{
					
					scope._current--;
				}
				
				scope._isChanging = false;
				location.hash = "#" + (scope._current + 1);
			}
		}
	};
	
	
	function Slide (node, id, obj){
		
		this.node = node;
		this.id = id;
		this.speedFadeIn = 200;
		this.fadeInValuePx = 20;
		this.fadeInValueEm = 1.25;
		//this.speedScaleIn = 700;
		
		this._animations = this._setAnimations();
		this._currentAnimation = 0;
		
		this._extends(obj);
		this._init();
	}
	
	Slide.ANCHOR_BLANK = "blank";
	Slide.ANIMATION = "Animation";
	Slide.FADEIN ="FadeIn";
	//Slide.SCALEIN ="ScaleIn";
	
	Slide.prototype = {
		
		_extends:function(obj){
			
			if(obj == undefined) { return; }
			
			for(var param in obj){
				
				this[param] = obj[param];
			}
		},
		_init:function (){
			
			this.node.style.position = "absolute";
			this.node.style.margin = 0;
			
			this._setAnchorTarget();
			this._setFontWeight();
		},
		_setAnchorTarget:function(){
			
			var anchors = classUtil.getElementsByClassName(Slide.ANCHOR_BLANK, "a", this.node);
			
			var num = anchors.length;
			for (var i=0; i<num; i++) {
				
				anchors[i].target = "_blank";
			}
		},
		_setFontWeight:function(){
			
			var scope = this;
			handler.add(document, "keyup", function(e){
				
				if(scope.id != Number(location.hash.replace("#",""))-1) { return; }
				
				var pNode = scope.node.getElementsByTagName("p");
				var liNode = scope.node.getElementsByTagName("li");
				
				var weightVal = "normal";
				
				// IE6対策
				var keyCode = e.keyCode == undefined ? 0: e.keyCode;
				// 足した値で判断
				var flag = e.charCode + keyCode;
				
				var uArrow = SlideControl.U_ARROW;
				var dArrow = SlideControl.D_ARROW;
				
				switch(flag) {
					
					case uArrow:
						
						weightVal = "bold";
						break;
						
					case dArrow:
						
						weightVal = "normal";
						break;
				}
				
				if(flag == uArrow || flag == dArrow){
					
					var pNum = pNode.length;
					for (var i=0; i<pNum; i++) {
						
						pNode[i].style.fontWeight = weightVal;
					}
					
					var liNum = liNode.length;
					for (var i=0; i<liNum; i++) {
						
						liNode[i].style.fontWeight = weightVal;
					}
				}
			})
		},
		_setAnimations:function(){
			
			var animations = classUtil.getElementsByClassName(Slide.ANIMATION, "", this.node);
			
			var num = animations.length;
			for (var i=0; i<num; i++) {
				
				animations[i].style.visibility = "hidden";
			}
			
			return  animations;
		},
		animates:function(){
			
			var target = this._animations[this._currentAnimation];
			var num = this._animations.length;
			
			function callback(){
				
				target.removeAttribute("style");
			}
			
			if(this._currentAnimation < num){
				
				var animator = kutil.createCSSAnimator();
				
				if(classUtil.isClass(target,Slide.FADEIN)){
					
					target.style.visibility = "visible";
					target.style.opacity = 0;
					//IE6
					target.style.zoom = 1;
					target.style.filter = "alpha(opacity=0)";
					
					if(SlideControl.IS_IE && target.tagName.match(/li/i)){
						
						target.style.listStyle = "none";
					}
					
					var ml = cssUtil.getCurrentStyle(target, "marginLeft");
					var pml = parseInt(ml);
					
					if(!isNaN(pml.toString())){
						
						if(ml.match("em")){
							
							target.style.marginLeft = parseInt(ml) - this.fadeInValueEm + "em";
							
						}else{
							
							target.style.marginLeft = parseInt(ml) - this.fadeInValuePx + "px";
						}
						animator.addAnimation(target, {opacity:1, marginLeft:ml}, this.speedFadeIn, 0, "linear", callback);
						
					}else{
						
						if(ml.match("em")){
							
							target.style.marginLeft = - this.fadeInValueEm + "em";
							
						}else{
							
							target.style.marginLeft = - this.fadeInValuePx + "px";
						}
						animator.addAnimation(target, {opacity:1, marginLeft:0}, this.speedFadeIn, 0, "linear", callback);
					}
				}
				
				this._currentAnimation++;
			}
			
		},
		resets:function(){
			
			if(this._currentAnimation > 0){
				
				this._currentAnimation--;
				
				this._animations[this._currentAnimation].style.visibility = "hidden";
			}
		}
	};
	
	
	function Index(obj){
		
		this.animation = kutil.createCSSAnimator();
		this.speed = 500;
		this._indexs = [];
		this._node = null;
		this._nodeW = 0;
		this._key = false;
		
		this._extends(obj);
		this._init();
	}
	
	Index.prototype = {
		
		_extends:function(obj){
			
			if(obj === undefined) { return; }
			
			for(var param in obj){
				
				this[param] = obj[param];
			}
		},
		_init:function (){
			
			
		},
		createIndex:function(){
			
			var doc = document;
			
			var list = '<ul>' + this._indexs.join("") + '</ul>'
			this._node = doc.createElement("div");
			//this._node.setAttribute("class", "Index");
			this._node.className = "Index";
			this._node.innerHTML = list;
			this._node.style.position = "absolute";
			this._node.style.display = "none";
			
			doc.body.appendChild(this._node);
		},
		insertIndex:function(slidNode, pageNum){
			
			var h = slidNode.getElementsByTagName("h2")[0];
			var hNum = 2;
			
			if(h === undefined){
				
				h = slidNode.getElementsByTagName("h3")[0];
				hNum = 3;
			}
			
			if(h === undefined){
				
				h = slidNode.getElementsByTagName("h1")[0];
				hNum = 1;
			}
			
			if(h !== undefined){
				
				this._indexs[this._indexs.length] = '<li class="list'+ hNum +'"><a href="#'+ pageNum +'">' + h.innerHTML + '</a></li>';
			}
		},
		showIndex:function(){
			
			this._node.style.display = "block";
			this._nodeW = this._node.offsetWidth;
			this._node.style.left = - this._nodeW + "px";
			
			this.animation.addAnimation(this._node, {left:"0px"}, this.speed, 0, "easeOutCubic");
		},
		closeIndex:function(){
			
			this.animation.addAnimation(this._node, {left:- this._nodeW + "px"}, this.speed, 0, "easeOutCubic");
		},
		toggleIndex:function(){
			
			if(!this._key){ this.showIndex(); }
			else{ this.closeIndex(); }
			
			this._key = !this._key;
		}
	};
	
	
	kutil.createRunOnLoad().addListener(function(){
		
		var slideControl = new SlideControl();
	});
	
})(window)