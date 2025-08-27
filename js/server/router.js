function route(pathname, handle, response, request, projectRoot) {

	//Logging route request path
	console.log("Routing request for path => " + pathname);

	var pathParts = pathname.split("/"); 
	var requestPathPart = "/" + pathParts[1];

	//handle logic
	if (typeof handle[requestPathPart] === 'function') {
		//if handle obj contains a defined function, run the function
		handle[requestPathPart](response, request, projectRoot);

	} else {
		//error handling for no handler found

		//server logging
		console.log("No handler found for => " + requestPathPart);

		//client response
		response.writeHead(404,{'Content-Type': 'text/plain'});
		response.write("Error: Resource not found!");
		response.end(); 
	}
}

exports.route = route;
