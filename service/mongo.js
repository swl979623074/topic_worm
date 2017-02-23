"use strict"
var mongojs = require('mongojs');
var path = require("path");
var config = require(path.join(__dirname,"..","conf","dbConfig.json"));

var conninsc;//

function connect() {
    if (conninsc && conninsc != null) {
		// console.log("exit");
        return conninsc;
    } else {
        var host = config.host || "127.0.0.1",
            port = config.port || 12345,
            database = config.database || "test",
            connection_string = 'mongodb://' + host + ':' + port + '/' + database;
        conninsc = mongojs(connection_string);
        return conninsc;
    }
}

/**
* 描述：向某个集合添加或更新一条文档
* @param cfg = {collection:"blog",filter:{"rowkey":"123"},data:{module:"systemInfo",function:"getSystemInfo",system:"linux",platform:"x86",time:"2016-12-12  12:34:54",status:"PASS"}};
* @param cb 回调函数
*/
var upsert = function(cfg,cb){
	var collect = connect().collection(cfg.collection);
	
	collect.find(cfg.filter,{}).sort({time:1}).toArray(function (err, doc) {
		if(doc.length > 0){
			collect.update(cfg.filter,cfg.data,true,function(err,doc){
				cb(err,doc);
			})
		}else{
			var abc = JSON.parse(JSON.stringify(cfg));
			collect.insert(abc.data,function(err,doc){
				cb(err,doc);
			})	
		}
	});
	
}

exports.upsert = upsert;
