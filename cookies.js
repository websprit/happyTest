//TODO:
//1. 无密码控件环境的自动登陆

var wrapperProps = {
	wrapper:{id:"noahInfoWrapper",class:"noahlu"},
	head:{id:"infoHead",class:"infoHead"},
	body:{id:"infoBody",class:"infoBody"},
	foot:{id:"infoFoot",class:"infoFoot"}
}
var styleDefault = {
	"_noahlu":"position:fixed;top:40px;right:50px;width:200px; height:100px; background:#FFFCDD;display:none;border:1px dashed #444;border-radius:5px;padding:15px;z-index:999;box-shadow: 5px 5px 10px #333;font-size:12px;text-align:left;",
	"_noahlu=h2":"font-size:18px;font-weight:bold;",
	"_noahluRed":"color:red;",
	"_noahlu=_option":"position:absolute;right:10px;top:10px;font-size:14px;"
};

styleDefault["_"+wrapperProps.foot.class] = "line-height: 2em;margin-top: 10px;background-color: #FFFDC7;padding: 10px;border: 1px solid #DDFB6C"

function $ (id){
	return document.getElementById(id);
}

function $$(selector){
	return document.querySelectorAll(selector);	
}

/**
 *为兼容变量命名规则，需要转化css选择器名称，转化规则：
 *'-'转化为'.';'='转化为' '
 **/
function parseSelector(selector){
	return selector.replace(/_/g,".").replace(/=/g," ");
}

/**
 *校验自动登陆的域名
 *@params {string} url
 *@return {boolean} 是否是登陆中心
 *
 **/
 function isAuthCenter(url){
	 var hostName = url.split('/')[2];
	 return (hostName.indexOf('alipay.net') != -1) && (hostName.indexOf('auth.') != -1 || hostName.indexOf('authcenter.') != -1)
}

/**
 *登陆中心自动填登陆信息
 *@params {localStorage object} authProps 登陆信息
 *
 **/
function autoLoginFill(authProps){
	//console.log(authProps.loginId)
	//console.log(authProps.password)
	authProps.loginId = authProps.loginId || "auth1@alitest.com";
	authProps.password = authProps.password || "111111";
	
	if(authProps.isAutoLogin != "1") return;

	setTimeout(function(){
		if(isAuthCenter(location.href)){
			console.log('autologin')
			$$('.alieditContainer')[0].parentNode.removeChild($$('.alieditContainer')[0])
			$$('.standardPwdContainer')[0].style.display = 'block'
			$('login').elements['J_aliedit_using'].value = 'false';
			$('authcode').value = '8888'
			$('authcode').onkeyup();

			$('password_input').value = authProps.password;
			$('logonId').value =  authProps.loginId;
			//$('login').submit()
		}
	},500)	
}

/**
 *初始化插件页面操作DOM
 *@params {object} props
 *
 **/
function DomInit (props) {
	this.addDom = function(){
		var dom = document.createElement('div');
		dom.id= props.wrapper.id ;
		dom.className = props.wrapper.class;
		this.addStyle(props.wrapper.class);
		dom.innerHTML = "<div id=\"" + props.head.id + "\" class=\"" + props.head.class +"\" ></div>" + 
		"<div id=\"" + props.body.id + "\" class=\"" + props.body.class + "\" ></div>" + 
		"<div id=\"" + props.foot.id + "\" class=\"" + props.foot.class +"\" ></div>"
		document.body.appendChild(dom);
	};

	this.addStyle = function(styles){
		var domStyle = document.createElement('style');
		domStyle.innerHTML = "";
		for(i in styles){
			domStyle.innerHTML += parseSelector(i) + "{" + styles[i] + "}";	
		}
		document.body.appendChild(domStyle)
	};

	//example:getDom('head')
	this.getDom = function(el){
		return 	$(props[el].id);
	};

	this.getHeight = function(el){
		return this.getDom(el).offsetHeight;	
	};

	this.fitHeight = function(){	
		var totalHeight = this.getHeight('head') + this.getHeight('body') + this.getHeight('foot');
		totalHeight > 500 ? this.getDom('wrapper').style.height = '530px' : this.getDom('wrapper').style.height = totalHeight + 30 + 'px'; 
	};
}

/**
 *创建自动刷新Iframe
 *
 **/
function SessionKeeper(){
	this.status = false;
	this._id = 'noahluSessionIframe';

	this.addIframe = function(){
		var iframeDom = document.createElement('iframe');
		iframeDom.id = this._id;
		iframeDom.width = 0;
		iframeDom.height = 0;
		iframeDom.className = 'fn-hide';
		document.body.appendChild(iframeDom);
		return iframeDom;
	};
	
	this.destory = function(){
		if(this.status){
			document.body.removeChild($(this._id))
			this.status = false;
		}else{
			return ;	
		}
	}

	this.startAutoLoad = function(domain){
		var sessionIframe = this.addIframe();	
		//var url = "http://" + domain;
		var url = location.href;
		setInterval(function(){
			sessionIframe.src = url;
			console.log('add url')
			setTimeout(function(){
				sessionIframe.src = "";
				console.log('remove url')
			},1000)
		},30000)	
		this.status = true;
	}
}

var domain = document.domain.split('.').slice(-2).join('.'); 
var happyTest = new DomInit(wrapperProps);
happyTest.addDom();
happyTest.addStyle(styleDefault);
happyTest.getDom('head').innerHTML = "<h2>测试无忧</h2> <p>当前域: " + "<span class='noahluRed'>" + domain + "</span>" ;
happyTest.getDom('foot').innerHTML = '<input id="clearCookies" type="button" value="清除本域cookies"/> \
	<a href="#" id="keepSession">保持session</a> \
	<br/> \
	<a href="http://authcenter.alipay.net/login/index.htm" target="_blank">自动登陆</a> \
	<br/><a href="chrome-extension://lpifcapigkcmkklhfgklaljpoppafoko/option.htm" target="_blank" id="noahluOption" class="option">>选项</a>';

var keepSession = new SessionKeeper();
$('keepSession').addEventListener('click',function(){
	if(keepSession.status){
		keepSession.destory();
		$('keepSession').innerHTML = "保持Session";
	}else{
		keepSession.startAutoLoad(domain);
		$('keepSession').innerHTML = "取消保持Session";
	}	
},false)

/**
 *页面初始化时与插件域信息交互，获取localStorage
 *
 *
 **/
chrome.extension.sendMessage({url: location.href}, function(response) {
	//console.log(response.localSInfo.isAutoLogin);
	autoLoginFill(response.localSInfo);	
});


/**
 *插件按钮点击后与插件域信息交互
 *
 *
 **/
chrome.extension.onConnect.addListener(function(port) {
	var domain = document.domain.split('.').slice(-2).join('.');
	port.onMessage.addListener(function(msg) {
		if (msg.status && msg.status == "on"){
			//console.log('page on')
			port.postMessage({domain: domain});
			happyTest.getDom('wrapper').style.display = "block";
		}else if (msg.status && msg.status == "off"){
			//console.log('page off')
			happyTest.getDom('wrapper').style.display = "none";
		}	

		if(msg.domainLength > 0){
			//console.log('has cookies')
			happyTest.getDom('body').innerHTML = "当前域cookie条数：" + "<span class='noahluRed'>" + msg.domainLength + "</span>";
			$('clearCookies').style.display = 'block';
			happyTest.fitHeight();
			happyTest.getDom('wrapper').addEventListener('click',removeHandler,false);
		}else if(msg.domainLength == 0){
			//console.log(msg.domainLength)
			happyTest.getDom('body').innerHTML = "当前域无cookie";
			$('clearCookies').style.display = 'none';
			happyTest.fitHeight();
			happyTest.getDom('wrapper').removeEventListener('click',removeHandler,false);
		}

		if(msg.removed){
			happyTest.getDom('body').innerHTML = "当前域cookie已移除。";
		}
	})

	function removeHandler (e){
		e.stopPropagation();
		if(e.target.id == "clearCookies"){
			port.postMessage({del:true,domain:domain})
			//console.log('post')
		}
	}

});

console.log('Noah lu is in');

