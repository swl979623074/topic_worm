'use strict'
var path = require("path"); 
var url = require("url");
var superagent  = require("superagent");
var mongo = require("./service/mongo.js");
var fs = require('fs');
var request = require("request");
var mkdirp = require('mkdirp');

var newsTypeConf = require(path.join(__dirname,"conf","newstype.json"));

var basepath = "https://ttpc.dftoutiao.com/jsonpc/refresh?";
//本地存储目录
var imgDir = path.join(__dirname ,'images');
console.log(imgDir)
var targetUrl = [];

function init(){
	for(var ele in newsTypeConf){
		var obj = {};
		obj["type"] = ele;
		obj["url"] = basepath+"type="+newsTypeConf[ele][0]+"&param=www.baidu.com";
		targetUrl.push(obj);
	}
	return targetUrl;
}

function downLoadImg(imgUrl){
	var str = imgUrl.split("mobile/")[1];
	var date = str.split("/")[0];
	var filename = str.split("/")[1];
	var dir =  path.join(imgDir + "/" +date);
	var imgPath = dir+ "/"+ filename;
	mkdirp(dir, function(err) {
		if(err){
			console.log(err);
		}else{
			request.head(imgUrl, function(err, res, body){
				request(imgUrl).pipe(fs.createWriteStream(imgPath));
			});
		}
	});
	return imgPath;
}

function upsert(newsType,data){
	var upsert = mongo.upsert;
	for(var i=0;i<data.length;i++){		
		data[i].lbimg[0].src = downLoadImg(data[i].lbimg[0].src);	
		data[i].miniimg.map(function(obj){
			obj.src = downLoadImg(obj.src);			
		})
		
		var cfg = {collection:newsType,filter:{"rowkey":data[i]['rowkey']},data:data[i]};
		upsert(cfg,function(err,doc){
			if(err){
				console.log(err);
			}else{
				
			}
		})
	}
}

function getDataFormWeb(cb){
	targetUrl.forEach(function(ele){		
		superagent.get(ele['url']).end(function(err,res){
			if(err)
				return err;
			
			var text = res.text.slice(res.text.indexOf("{"),res.text.length-1);
			var jsonData = JSON.parse(text).data;
			cb(ele['type'],jsonData);
		})
	})
};

(function(){
	console.log("the app is running");
	init();
	//每五分钟执行一次爬虫
	
	function run(){
		var date = new Date();
		var time = date.toLocaleDateString()+" "+date.toLocaleTimeString();
		console.log(time,"正在抓取数据....")
		getDataFormWeb(upsert);
		setTimeout(function(){
			run();
		},300000)
	}
	run(run);
	
})();

/***
mainland 国内
world 国际
society 社会
ent 娱乐
health 健康
fashion 时尚
mil 军事
tech 科技
auto 汽车
finance 财经
history 人文
games 游戏
astro 星座
home 家居
nba NBA
premierleague 英超
*/