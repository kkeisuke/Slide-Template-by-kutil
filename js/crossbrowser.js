/**
 * @fileoverview クロスブラウザ
 */

(function(){
	
	if(kutil == undefined) { return; }
	
	var classUtil = kutil.createClassUtil();
	kutil.createRunOnLoad().addListener(function(){
		var ua = navigator.userAgent;
		if(ua.search(/Mac OS X.*5[\.\d]+ Safari/) != -1 && ua.search(/Chrome/) == -1){
			setIndet(0.9);
		}
	});
	
	function setIndet(n){
		var notices = classUtil.getElementsByClassName("Notice");
		var num = notices.length;
		for (var i=0; i<num; i++) {
			notices[i].style.textIndent = (- n) + "em";
			notices[i].style.paddingLeft = n + "em";
		}
	}
	
})();
