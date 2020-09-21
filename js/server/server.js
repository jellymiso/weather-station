//===============
//Modules Import
//===============
var http = require('http');
var url = require("url");
//
//
function startServer(route, handle) {
	function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    
    //server logging
		console.log("Request for " + pathname + " received.");
		//request.setEncoding('utf8');

		route(pathname, handle, response, request);
		
	}
	http.createServer(onRequest).listen(process.env.PORT || 41130);
	console.log("Server has started.");
	console.log('Process ID:', process.pid);
}

//startServer(router, handle);
// export the function
exports.startServer= startServer;
