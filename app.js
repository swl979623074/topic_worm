'use strict'
var path = require("path"); 
var url = require("url");
var superagent  = require("superagent");
// var cheerio = require("cheerio");
var mongo = require("./service/mongo.js");
var conf = require("./conf/newstype.json");

var basepath = "https://ttpc.dftoutiao.com/jsonpc/refresh?";

var targetUrl = [];

function init(){
	for(var ele in conf){
		var obj = {};
		obj["type"] = ele;
		obj["url"] = basepath+"type="+conf[ele][0]+"&param=www.baidu.com";
		targetUrl.push(obj);
	}
	return targetUrl;
}

function upsert(newsType,data){
	var upsert = mongo.upsert;
	for(var i=0;i<data.length;i++){
		var cfg = {collection:newsType,filter:{"rowkey":data[i]['rowkey']},data:data[i]};
		upsert(cfg,function(err,doc){
			if(err){
				console.log(err);
			}else{
				// console.log("123",doc);
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