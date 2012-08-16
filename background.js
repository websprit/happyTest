/**
 *TODO
 *Cookie清理的Domain暂时只支持alipay.com这样的域名，对sina.com.cn这样的域名无效
 **/

var flag = "off";

function urlToDomain(url){
	var hostName = url.split('/')[2];
	domain = hostName.split('.').slice(-2).join('.');
	return domain;
}

/**
 *
 *右键菜单清理Cookie
 **/
chrome.contextMenus.create({
	"title":"清除本域Cookie",
	"onclick":function(clickData,tab){
		var domain = urlToDomain(clickData.pageUrl);
		chrome.cookies.getAll({domain:domain},function(el){
			if(!el || el.length < 1) return ;
			for(var i in el){
				var url = "http" + (el[i].secure ? "s" : "") + "://" + el[i].domain + el[i].path;
				chrome.cookies.remove({url:url,name:el[i].name})
			}
			//alert('remove done.')
		})
	}
})

/**
 *发送localStorage信息到页面
 *
 **/
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	sendResponse({localSInfo:localStorage})	
	//重置插件按钮状态
	flag = "off";
	chrome.browserAction.setIcon({path:"ico48Gray.png"})
})

/**
 *点击插件按钮后与页面交互 
 *
 **/
chrome.browserAction.onClicked.addListener(function(){
	chrome.tabs.getSelected(null, function(tab) {
		var port =  chrome.tabs.connect(tab.id, {name: "queryCookies"});

		if(flag == "on"){
			flag = "off";
			chrome.browserAction.setIcon({path:"ico48Gray.png"})
			port.postMessage({status: "off"});
			//alert('on')
		}else{
			flag = "on";
			chrome.browserAction.setIcon({path:"ico48.png"})
			port.postMessage({status: "on"});
			//alert('off')
		}

		port.onMessage.addListener(function(msg) {
			if(msg.del && msg.domain){
				chrome.cookies.getAll({domain:msg.domain},function(el){
					if(!el || el.length < 1) return ;
					for(var i in el){
						var url = "http" + (el[i].secure ? "s" : "") + "://" + el[i].domain + el[i].path;
						//	alert(msg.domain + ' ' + url + ' ' + el[i].name )
						chrome.cookies.remove({url:url,name:el[i].name})
					}
					port.postMessage({removed:true})
					//alert('remove done.')
				})

			}else if(msg.domain){
				chrome.cookies.getAll({domain:msg.domain},function(el){
					port.postMessage({domainLength:el.length})
				})
			}
		})

	});
})


