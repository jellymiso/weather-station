//===============
//Modules Import
//===============
var fs = require("fs");
var https = require("https");
var path = require("path");
var qs = require('querystring');
var os = require('os');
var xmldomPS = require('xmldom').DOMParser;

//get and response initial html
function appStart(response, request, projectRoot) {
	//server logging
	console.log("Website Started...");
	//
	//function logic
  readHTML(projectRoot + "/html/index.htm", response);
}

//route static assets
function appStaticFiles(response, request, projectRoot) {
	//server logging
	console.log("Handling static assets route...");
	var pathParts = request.url.split("/");
	if (pathParts[pathParts.length - 1].split(".")[1] != null) {
		var requestPathPart = pathParts[1];
		switch (requestPathPart) {
			case "css":
				console.log("--Static Asset => " + request.url);
console.log("Attempting to serve file from path:", projectRoot);

				try {
					if (fs.existsSync(projectRoot + request.url)) {
						//file exists
						response.writeHead(200, { "Content-Type": "text/css" });
						response.write(fs.readFileSync(projectRoot + request.url , "utf8"));
					}
				} catch (err) {
					response.writeHead(404, { "Content-Type": "text/plain" });
					response.write("Resource not found!");
				}


				break;
			case "js":
				console.log("--Static Asset => " + request.url);

				try {
					if (fs.existsSync(projectRoot + request.url)) {
						//file exists
						response.writeHead(200, { "Content-Type": "text/javascript" });
						response.write(fs.readFileSync(projectRoot + request.url, "utf8"));
					}
				} catch (err) {
					response.writeHead(404, { "Content-Type": "text/plain" });
					response.write("Resource not found!");
				}
				break;
			case "images":
				console.log("--Static Asset => " + request.url);

				var pathext = path.extname(request.url);
				if (pathext == ".jpg") {
					console.log("--Asset Type => " + pathext);
					try {
						if (fs.existsSync(projectRoot + request.url)) {
							//file exists
							response.writeHead(200, { "Content-Type": "image/jpeg" });
							response.write(fs.readFileSync(projectRoot + request.url));
						}
					} catch (err) {
						response.writeHead(404, { "Content-Type": "text/plain" });
						response.write("Resource not found!");
					}
				}
				else if (pathext == ".png") {
					console.log("--Asset Type => " + pathext);
					try {
						if (fs.existsSync(projectRoot + request.url)) {
							//file exists
							response.writeHead(200, { "Content-Type": "image/png" });
							response.write(fs.readFileSync(projectRoot + request.url));
						}
					} catch (err) {
						response.writeHead(404, { "Content-Type": "text/plain" });
						response.write("Resource not found!");
					}
				}
				else {
					console.log("--Asset Type => " + pathext + " (ERROR: Not Supported!)");
					response.writeHead(404, { "Content-Type": "text/plain" });
					response.write("Resource not found!");
				}

				break;
			default:
				console.log("--No Static Asset Found");

				response.writeHead(404, { "Content-Type": "text/plain" });
				response.write("Resource not found!");
				break;
		}
		response.end();
	}
	else {
		response.writeHead(403, { 'Content-Type': 'text/plain' });
		response.write("Requested resource is fobidden!");
		response.end();
	}
}

//get weather data
function getWeatherData(response, request) {
	console.log("Getting Request Parameters...");
	if (request.method == 'POST') {
		var accumulatedData = "";
		var parsedValue = "";

		request.on('data', function (chunk) {
			accumulatedData += chunk;
		});

		request.on('end', function () {
			console.log('--Request Process Complete...');
			console.log("--Requested Param String => " + accumulatedData);
			//
			parsedValue = qs.parse(accumulatedData);
			//
			var weatherData = JSON.parse(parsedValue["weatherData"]);
			var dataYear = parsedValue["year"];
			var dataMonthFrom = parsedValue["monthFrom"];
			var dataMonthTo = parsedValue["monthTo"];
			var displayFormat = JSON.parse(parsedValue["displayFormat"]);
			console.log("--Parsed values => " + "weatherData: " + weatherData + " | dataYear: " + dataYear + " | dataMonthFrom: " + dataMonthFrom + " | dataMonthTo: " + dataMonthTo + " | displayFormat: " + displayFormat);
			console.log("--Checking requested file type on server now =>");
			//
			//check if requested year of data json is available, otherwise it is xml
			webPageExistCheck(dataYear).then(function (value) {
				var isJSONdata = value;
				if (isJSONdata) {
					console.log("::> File is JSON!")
					processRequest(response, dataYear, dataMonthFrom, dataMonthTo, weatherData, displayFormat, ".json");
				}
				else {
					console.log("::> File is XML!");
					processRequest(response, dataYear, dataMonthFrom, dataMonthTo, weatherData, displayFormat,".xml");
				}
			}).catch(function (reason) {
				throw "ERROR: " + reason;
			});
		});
		//
	}
	else {
		response.writeHead(405, { 'Content-Type': 'text/plain' });
		response.end("Method not allowed!!");
	}
	//


}

//process for requesting data and writing to client
function processRequest(response, dataYear, dataMonthFrom, dataMonthTo, weatherData, displayFormat, fileFormat) {
	requestData(dataYear, dataMonthFrom, dataMonthTo, weatherData, fileFormat).then(function (value) {
		console.log("::> SUCCESS: Begin sending to client now...");
		//return data to client
		var objToSend = value;
		objToSend.DisplayFormat = displayFormat;
		response.writeHead(200, { "Content-Type": "application/json" });
		response.end(JSON.stringify(objToSend));
	}).catch(function (reason) {
		console.log("::> ERROR: There was an error getting the requested data | REASON: " + reason);

		var errObj = { error: "There was an error getting the requested data." };
		response.writeHead(200, { "Content-Type": "application/json" });
		response.end(JSON.stringify(errObj));
	});
}

//check if webpage exist via head call 
async function webPageExistCheck(yearOfData) {
	return await new Promise((resolve, reject) => {
		//
		var myReq = https.request({
			hostname: 'raw.githubusercontent.com',
			path: '/jellymiso/resource-dump/main/weather-station/data/' + yearOfData + '.json',
			method: 'HEAD'
		});
		//
		myReq.on('response', resp => {
			//console.log(resp);
			if (resp.statusCode == "200") {
				resolve(true);
			}
			else {
				resolve(false);
			}
		});
		//
		myReq.on('error', err => {
			reject(err.message);
		});

		myReq.end();

	});
}

//request the requested file
async function requestData(yearOfData, monthFrom, monthTo, weatherData, formatExt) {
	//
	console.log("--Requesting the " + formatExt + " from the server now...");
	//
	return await new Promise((resolve, reject) => {

		downloadFile(yearOfData, formatExt, function (dlStatus) {
			//
			var myDataObj = {};
			myDataObj["Year"] = yearOfData;
			myDataObj["Months"] = {};
			//
			if (dlStatus) {
				console.log("::> SUCCESS");
				//successful download, continue to read downloaded file at /data/
				readDataFile(
					"./data/data-" + yearOfData + formatExt, //path
					myDataObj, monthFrom, monthTo, weatherData, //requested info
					function (readFileStatus, statusMsg, returnedDataObject) { //callback
						if (readFileStatus) {
							console.log("--Sending the extracted data back... =>");
							resolve(returnedDataObject)
						}
						else {
							console.log("--Error reading the file...");
							reject(statusMsg)
						}
					}
				);
			}
			else {
				console.log("::> ERROR, System will fallback to local dataset instead...");
				//failed downloading, proceed with reading local file at /data/local-data/
				readDataFile(
					"./data/local-data/data-" + yearOfData + formatExt, //path
					myDataObj, monthFrom, monthTo, weatherData,  //requested info
					function (readFileStatus, statusMsg, returnedDataObject) { //callback
						if (readFileStatus) {
							console.log("--Sending the extracted data back... =>");
							resolve(returnedDataObject)

						}
						else {
							console.log("--Error reading the file...");
							reject(statusMsg)
						}
					}
				);
			}


		})
	});

}

//download requested file
function downloadFile(yearOfData, formatExt, onComplete) {
	//writable stream to download the data
	var path = "./data/data-" + yearOfData + formatExt;
	var file = fs.createWriteStream(path);
	var isDLsuccess = false;
	//
	var myReq = https.get("https://raw.githubusercontent.com/jellymiso/resource-dump/main/weather-station/data/" + yearOfData + formatExt, (resp) => {

		//download data file
		console.log("--Begin downloading =>")
		resp.pipe(file);
		//download finish
		file.on("finish", () => {
			file.end();
			isDLsuccess = true;
			if (onComplete) { onComplete(isDLsuccess); }
		})

		//error with request
	}).on("error", (err) => {
		//unlink if error
		fs.unlink(path);
		//
		console.log(err.message);
		if (onComplete) { onComplete(isDLsuccess); }
	});
}

//read file containing requested data
function readDataFile(path, dataObj, monthFrom, monthTo, weatherData, onComplete) {
	//
	console.log("--Reading file containing the data requested...");
	//
	var isReadSuccess = false; //set flag
	//
	//processing of data object to store requested data 
	var dataMonthsObj = dataObj.Months;
	var monthFromInt = parseInt(convertMonth(monthFrom)); //e.g. monthFrom => 'Jan'
	var monthToInt = parseInt(convertMonth(monthTo));
	var weatherDataSplit = weatherData.toString().split(',');
	for (var i = monthFromInt; i <= monthToInt; i++) {
		dataMonthsObj[convertMonth(i)] = {};
		for (var j = 0; j < weatherDataSplit.length; j++) {
			if (weatherDataSplit[j] == "Wind Speed") {
				dataMonthsObj[convertMonth(i)].WindSpeed = 0;
			}
			else if (weatherDataSplit[j] == "Solar Radiation") {
				dataMonthsObj[convertMonth(i)].SolarRadiation = 0;
			}
		}
	}
	//
	//
	fs.readFile(path, { encoding:'utf-8' }, function (err, content) {
		if (err) {
			if (onComplete) { onComplete(isReadSuccess, err.message); }
		}
		else {

			//
			var myPathSplit = path.split(".");
			//if is a xml file
			if (myPathSplit[myPathSplit.length - 1] == 'xml') {
				//xml stuffs
				var myXML = content.toString();
				var xmlDoc = new xmldomPS().parseFromString(myXML, 'text/xml');
				var targetNodes = xmlDoc.getElementsByTagName('record'); // find records nodes
				//
				//loop the records
				for (var i in targetNodes) {
					//
					//console.log(targetNodes[i]);
					//To skip the last 2 elements that are not part of the data and causing issue with getElementsByTagName
					if (typeof targetNodes[i].getElementsByTagName === 'function') {
						//
						//process relevant data
						var dateStr = targetNodes[i].getElementsByTagName("date")[0].firstChild.nodeValue;  //format: 20/08/2007
						var date = new Date(dateStr.split("/")[2], dateStr.split("/")[1] - 1, dateStr.split("/")[0]);
						var currentMonth = date.getMonth() + 1;
						var windSpd = parseInt(targetNodes[i].getElementsByTagName("ws")[0].firstChild.nodeValue);
						var solarRad = parseInt(targetNodes[i].getElementsByTagName("sr")[0].firstChild.nodeValue);
						//
						//adding data to dataObj
						for (var i = monthFromInt; i <= monthToInt; i++) {
							//if current record belongs to current month as obj key
							if (i == currentMonth) {

								//do the adding, based on requested data
								for (var j = 0; j < weatherDataSplit.length; j++) {
									if (weatherDataSplit[j] == "Wind Speed") {
										dataMonthsObj[convertMonth(i)].WindSpeed += windSpd;
									}
									else if (weatherDataSplit[j] == "Solar Radiation") {
										//only solar radiation >=100 W/m2 are to be considered in the application
										if (solarRad >= 100) {
											dataMonthsObj[convertMonth(i)].SolarRadiation += solarRad;
										}
									}
								}
			
								//
							}
						}
					}
				}
				//
				//convert to higher point units of measurement
				for (var i = monthFromInt; i <= monthToInt; i++) {
					for (var j = 0; j < weatherDataSplit.length; j++) {
						if (weatherDataSplit[j] == "Wind Speed") {
							dataMonthsObj[convertMonth(i)].WindSpeed = unitConversion("Wind Speed", dataMonthsObj[convertMonth(i)].WindSpeed);
						}
						else if (weatherDataSplit[j] == "Solar Radiation") {
							dataMonthsObj[convertMonth(i)].SolarRadiation = unitConversion("Solar Radiation", dataMonthsObj[convertMonth(i)].SolarRadiation);
						}
					}
				}
				//
				console.log("--Finished reading the file and the extracted data is => ");
				console.log(dataObj);
				isReadSuccess = true;
				if (onComplete) {
					onComplete(isReadSuccess, null, dataObj);
				}
			}
			//if is a json file
			else if (myPathSplit[myPathSplit.length - 1] == 'json') {
				//json stuffs
				var myJson = JSON.parse(content);
				var jsonTarget = myJson.weather.record;
				//
				//loop the records
				for (var i = 0; i < jsonTarget.length; i++) {
					//process relevant data
					var dateStr = jsonTarget[i].date;  //format: 20/08/2007
					var date = new Date(dateStr.split("/")[2], dateStr.split("/")[1] - 1, dateStr.split("/")[0]);
					var currentMonth = date.getMonth() + 1;
					var windSpd = parseInt(jsonTarget[i].ws);
					var solarRad = parseInt(jsonTarget[i].sr);
					//
					//adding data to dataObj
					for (var j = monthFromInt; j <= monthToInt; j++) {
						//if current record belongs to current month as obj key
						if (j == currentMonth) {
							//
							//do the adding
							for (var k = 0; k < weatherDataSplit.length; k++) {
								if (weatherDataSplit[k] == "Wind Speed") {
									dataMonthsObj[convertMonth(j)].WindSpeed += windSpd;
								}
								else if (weatherDataSplit[k] == "Solar Radiation") {
									//only solar radiation >=100 W/m2 are to be considered in the application
									if (solarRad >= 100) {
										dataMonthsObj[convertMonth(j)].SolarRadiation += solarRad;
									}
								}
							}

							//
						}
					}
				}
				//
				//convert to higher point units of measurement
				for (var i = monthFromInt; i <= monthToInt; i++) {
				}

				for (var i = monthFromInt; i <= monthToInt; i++) {
					for (var j = 0; j < weatherDataSplit.length; j++) {
						if (weatherDataSplit[j] == "Wind Speed") {
							dataMonthsObj[convertMonth(i)].WindSpeed = unitConversion("Wind Speed", dataMonthsObj[convertMonth(i)].WindSpeed);
						}
						else if (weatherDataSplit[j] == "Solar Radiation") {
							dataMonthsObj[convertMonth(i)].SolarRadiation = unitConversion("Solar Radiation", dataMonthsObj[convertMonth(i)].SolarRadiation);
						}
					}
				}
				//
				console.log("--Finished reading the file and the extracted data is => ");
				console.log(dataObj);
				isReadSuccess = true;
				if (onComplete) {
					onComplete(isReadSuccess, null, dataObj);
				}
			}
		}
	})
	
}

//convert wind speed and solar radiation to a higher point units
function unitConversion(type, value) {
	if (type == "Wind Speed") {
		//Monthly average Wind Spd.,(m/s) to (km/h), nearest integer
		var totalWindSpd = (value * 60 * 60) / 1000; //total for the month
		return Math.round(totalWindSpd / 30) //monthly average, rounded
	}
	else if (type == "Solar Radiation") {
		//Total Solar Rad. per Month, (W/m2) to (kWh/m2), nearest integer
		var totalRoundedSolarRad = Math.round((value * (1 / 6)) / 1000)
		return totalRoundedSolarRad;
	}
	else {
		throw ("Type is unsupported.")
	}
}

//convert textual month to the numeral form string or vice versa
function convertMonth(month) {
	var monthsConvObj = {
		'jan': '01',
		'feb': '02',
		'mar': '03',
		'apr': '04',
		'may': '05',
		'jun': '06',
		'jul': '07',
		'aug': '08',
		'sep': '09',
		'oct': '10',
		'nov': '11',
		'dec': '12'
	}
	if (typeof month === 'string') {
		if (month.length > 3) {
			month = month.substring(0, 3);
		}
		return monthsConvObj[month.toLowerCase()];
	}
	else if (typeof month === 'number') {
		for (var key in monthsConvObj) {
			if (parseInt(monthsConvObj[key]) === month) {
				return key;
			}
		}
	}
	else {
		throw "Month value not supported!";
	}
}

//get html and response
function readHTML(path, response) {
	fs.readFile(path, function (error, pageData) {
		if (error) {
			console.log("--RESPONSE ERROR:" + error.message);
			response.writeHead(404, { 'Content-Type': 'text/plain' });
			response.write(error.message);
			response.end();

		} else {
			console.log("--Response Data ==> " + pageData);
			response.writeHead(200, { 'Content-Type': 'text/html' });
			response.end(pageData);
		}
	});
}


//exports
exports.appStart = appStart;
exports.appStaticFiles = appStaticFiles;
exports.getWeatherData = getWeatherData;



