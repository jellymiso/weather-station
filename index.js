//===============
//Modules Import
//===============
var server = require("./js/server/server");
var router = require("./js/server/router");
var requestHandler = require("./js/server/requestHandlers");
//
var handle = {};

handle["/"] = requestHandler.appStart;
handle["/css"] = requestHandler.appStaticFiles;
handle["/js"] = requestHandler.appStaticFiles;
handle["/images"] = requestHandler.appStaticFiles;
handle["/getWeatherData"] = requestHandler.getWeatherData;
//
server.startServer(router.route, handle);
