
var indexPage = {
	init: function () {
		var ip = indexPage;
		//
		ip.weatherData.init();

	},
	weatherData: {
		init: function () {
			var ip = indexPage;

			var btnRetrieve = $("#abnSearch");

			ip.weatherData.datePicker(function () {
				ip.weatherData.resetForm.init();
				btnRetrieve.on('click', function () {
					ip.weatherData.submitForm.init();
				});
			});


		},
		datePicker: function (onComplete) {

			//Year
			$("#txtYear").datepicker({
				language: 'en',
				minView: "years",
				view: "years",
				navTitles: {
					years: 'yyyy1 &mdash; yyyy2'
				},
				startDate: new Date(2007, 0),
				minDate: new Date(2007, 0), // 2007/01/01
				maxDate: new Date(2016, 0), // 2016/03/01
				dateFormat: "yyyy",
				position: "top left",
				prevHtml: "<div class='prev action'><span class='icon'></span></div>",
				nextHtml: "<div class='next action'><span class='icon'></span></div>",
				onShow: function (inst, animationCompleted) {
					$("#txtYear").addClass("active");
					inst.$datepicker.css("width", $('#txtYear').outerWidth());
				},
				onHide: function (inst, animationCompleted) {
					if ($("#txtYear").val() == "") {
						$("#txtYear").removeClass("active")
					}
				},
				onSelect: function (formattedDate, date, inst) {
					$("#abnReset").removeClass("disabled");
					var myMonthFromDP = $('#txtMonthFrom').datepicker().data('datepicker');
					var myMonthToDP = $('#txtMonthTo').datepicker().data('datepicker');
					//
					//clear months
					myMonthFromDP.clear();
					myMonthToDP.clear();
					$('#txtMonthFrom').removeClass("active")
					$('#txtMonthTo').removeClass("active")
					//
					var otherDecades = $('.datepicker--cell.-other-decade-:not(".-disabled-")')
					if (otherDecades.text() != formattedDate) {
						inst.hide();
					}
					if (formattedDate == "2016") {

						myMonthFromDP.update({
							maxDate: new Date(2019, 2)
						});
						myMonthToDP.update({
							maxDate: new Date(2019, 2)
						});
					}
					else {
						myMonthFromDP.update({
							maxDate: new Date(2019, 11)
						});
						myMonthToDP.update({
							maxDate: new Date(2019, 11)
						});
					}
				}
			});
			//
			//Month From
			$("#txtMonthFrom").datepicker({
				language: 'en',
				classes: 'pink title-disabled',
				minView: "months",
				view: "months",
				navTitles: {
					months: 'Month From'
				},
				selectOtherYears: false,
				showOtherYears: false,
				selectOtherMonths: false,
				showOtherMonths: false,
				autoClose: true,
				startDate: new Date(2018, 12),
				minDate: new Date(2019, 0), // 2007/01/01
				maxDate: new Date(2019, 11), // 2016/03/01
				dateFormat: "MM",
				position: "top left",
				autoClose: true,
				prevHtml: "<div class='prev action'><span class='icon'></span></div>",
				nextHtml: "<div class='next action'><span class='icon'></span></div>",
				onShow: function (inst, animationCompleted) {
					$("#txtMonthFrom").addClass("active");
					inst.$datepicker.css("width", $('#txtMonthFrom').outerWidth());
					inst.$datepicker.find(".datepicker--nav").off("click");

				},
				onHide: function (inst, animationCompleted) {
					if ($("#txtMonthFrom").val() == "") {
						$("#txtMonthFrom").removeClass("active")
					}
				},
				onSelect: function (formattedDate, date, inst) {
					$("#abnReset").removeClass("disabled");
					//
					var myMonthToDP = $('#txtMonthTo').datepicker().data('datepicker');
					myMonthToDP.update({
						minDate: new Date(date)
					});
				}
			});
			//
			//Month To
			$("#txtMonthTo").datepicker({
				language: 'en',
				classes: 'pink title-disabled',
				minView: "months",
				//inline:true,
				view: "months",
				navTitles: {
					months: 'Month To'
				},
				selectOtherYears: false,
				showOtherYears: false,
				selectOtherMonths: false,
				showOtherMonths: false,
				autoClose: true,
				startDate: new Date(2018, 12),
				minDate: new Date(2019, 0), // 2007/01/01
				maxDate: new Date(2019, 11), // 2016/03/01
				dateFormat: "MM",
				position: "top left",
				prevHtml: "<div class='prev action'><span class='icon'></span></div>",
				nextHtml: "<div class='next action'><span class='icon'></span></div>",
				onShow: function (inst, animationCompleted) {
					$("#txtMonthTo").addClass("active");
					inst.$datepicker.css("width", $('#txtMonthTo').outerWidth());
					inst.$datepicker.find(".datepicker--nav").off("click");
				},
				onHide: function (inst, animationCompleted) {
					if ($("#txtMonthTo").val() == "") {
						$("#txtMonthTo").removeClass("active")
					}
				},
				onSelect: function (formattedDate, date, inst) {
					$("#abnReset").removeClass("disabled");
					//
					var myMonthFromDP = $('#txtMonthFrom').datepicker().data('datepicker');
					myMonthFromDP.update({
						maxDate: new Date(date)
					});
				}
			});
			//
			if (onComplete) { onComplete(); }
		},
		resetForm: {
			init: function () {
				var ip = indexPage;
				var form = $(".form-main-div .fields-wrap-div");
				form.find("input[name='cbgWeather'], input[name='cbgDisplay']").on("change", function () {
					form.find("#abnReset").removeClass("disabled");
				})

				form.find("#abnReset").on('click', function () {
					ip.weatherData.resetForm.processReset();
					$(this).addClass("disabled");

				})

			},
			processReset: function (onComplete) {
				var form = $(".form-main-div .fields-wrap-div");
				form.find("input[name='cbgWeather'], input[name='cbgDisplay'], input[type='text']").each(function (i, e) {
					if ($(e).attr('type') == 'text') {
						$(e).val("");
						$(e).removeClass("active");
					} else {
						$(e).prop('checked', false);
					}
				});

			}
		},
		chart: {
			init: function (dataset) {
				var chartDiv = $(".result.graph");
				var chartCanvas = chartDiv.find("canvas");
				chartDiv.addClass("hide");
				Chart.helpers.each(Chart.instances, function (instance) {
					instance.chart.destroy();//destroy any previous chart
				  //console.log(instance)
				})
				//
				var chartType = 'line';
				var year = dataset.Year;
				var months = dataset.Months
				var xAxisLabel = [];
				var xAxisTitle = 'YEAR ', chartTitle = 'MONTHLY WEATHER DATA FOR ';
				var wsData = [], srData = [];
				var chartDataset = [];
				var wsDataset = {
					//data: [86, 114, 106, 106, 107, 111, 133, 221, 783, 2478, 932, 777],
					yAxisID: 'windSpd',
					label: "Wind Speed (km/h)",
					borderColor: "#7feaff",
					backgroundColor: "rgba(127,234,255, 0.5)",
					pointStyle: 'line',
					pointBorderWidth: 4,
					pointHoverBorderWidth: 4,
					fill: true
				};
				var srDataset = {
					//data: [282, 350, 411, 502, 635, 809, 947, 1402, 3700, 5267, 4321, 5432],
					yAxisID: 'solarRad',
					label: "Solar Radiation (kWh/m²)",
					borderColor: "#ff71a8",
					backgroundColor: "rgba(255,113,168,0.25)",
					pointStyle: 'line',
					pointBorderWidth: 4,
					pointHoverBorderWidth: 4,
					fill: true
				};
				var yAxisOption = [];
				var yAxisOptionWS = {
					id: 'windSpd',
					type: 'linear',
					position: 'left',
					scaleLabel: {
						display: true,
						labelString: "km/h",
						fontFamily: "'Overpass', Arial, Helvetica, sans- serif"
					},
					ticks: {
						precision: 0,
						min:0,
						fontFamily: "'Overpass', Arial, Helvetica, sans- serif"
					},
					gridLines: {
						color: '#afd8e0',
					}
				};
				var yAxisOptionSR = {
					id: 'solarRad',
					type: 'linear',
					position: 'right',
					scaleLabel: {
						display: true,
						labelString: "kWh/m²",
						fontFamily: "'Overpass', Arial, Helvetica, sans- serif"
					},
					ticks: {
						min: 0,
						precision: 0,
						fontFamily: "'Overpass', Arial, Helvetica, sans- serif"
					},
					gridLines: {
						color: '#e4b2c6',
						zeroLineColor: '#ccbeaf',
					}
				};
				//
				var monthCount = 0;
				for (var month in months) {
					if (!months.hasOwnProperty(month)) {
						continue;
					}
					//process start here
					//
					//x-axis
					xAxisLabel.push(month.toUpperCase())
					//
					//if solarradiation is a choice, for each month:
					if (("SolarRadiation" in months[month])) {
						srData.push(months[month].SolarRadiation);
					}
					//if windspeed is a choice, for each month:
					if (("WindSpeed" in months[month])) {
						wsData.push(months[month].WindSpeed);
					}
					monthCount++;
				}
				//
				//years
				chartTitle += year;
				xAxisTitle += year;

				//check if wind speed is one of the choice
				if (("WindSpeed" in months[Object.keys(months)[0]])) {
					wsDataset.data = wsData;
					chartDataset.push(wsDataset);
					yAxisOption.push(yAxisOptionWS);
				}

				//check if solar radiation is one of the choice
				if (("SolarRadiation" in months[Object.keys(months)[0]])) {
					srDataset.data = srData;
					chartDataset.push(srDataset);
					yAxisOption.push(yAxisOptionSR);

				}

				//change chart to bar chart with lesser than 3 months
				if (monthCount < 3) {
					chartType = "bar";
				}

				//
				var myLineChart = new Chart(chartCanvas, {
					type: chartType,
					data: {
						labels: xAxisLabel, //["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
						datasets: chartDataset
					},
					options: {
						title: {
							display: true,
							text: chartTitle,
							fontSize: 20,
							fontFamily: "'Overpass', Arial, Helvetica, sans- serif"
						},
						legend: {
							display: true,
							labels: {
								fontSize: 16,
								fontFamily: "'Overpass', Arial, Helvetica, sans- serif",
								usePointStyle: true
							}
						},
						tooltips: {
							titleFontFamily: "'Overpass', Arial, Helvetica, sans- serif",
							bodyFontFamily: "'Overpass', Arial, Helvetica, sans- serif"
						},
						scales: {
							xAxes: [{
								gridLines: {
									color: '#ccbeaf',
								},
								scaleLabel: {
									display: true,
									labelString: xAxisTitle,
									fontFamily: "'Overpass', Arial, Helvetica, sans- serif"
								},
								ticks: {
									fontFamily: "'Overpass', Arial, Helvetica, sans- serif"
								}
							}],
							yAxes: yAxisOption
						}
					}
				});
				//console.log(myLineChart)
				chartDiv.removeClass("hide");
			}
		},
		pageLoader: {
			show: function () {
				var loader = $('.page-loader');
				loader.removeClass('hide');
			},
			hide: function () {
				var loader = $('.page-loader');
				loader.addClass('hide');
			}
		},
		processData: {
			init: function (dataset, monthFrom, monthTo) {
				//
				var ip = indexPage;
				var process = ip.weatherData.processData;
				var chart = ip.weatherData.chart;
				//
				var queryMsg = $('.result-div .form-options-text');
				queryMsg.addClass('hide');

				//process display formats
				//if table
				if (/table/i.test(dataset.DisplayFormat)) {
					process.setTable(dataset)
				}
				else {
					$(".result.table").addClass("hide");
				}
				//if graph
				if (/graph/i.test(dataset.DisplayFormat)) {
					chart.init(dataset)
				}
				else {
					$(".result.graph").addClass("hide");
				}

				//set query note
				queryMsg.find('.option .year').text(dataset.Year);
				queryMsg.find('.option .month-from').text(monthFrom);
				queryMsg.find('.option .month-to').text(monthTo);
				queryMsg.removeClass('hide');
				
				$("html, body").animate({ scrollTop: $('.result-div').offset().top }, 1000);
			},
			setTable: function (dataset) {
				//
				var ip = indexPage;
				var util = ip.weatherData.util;
				//
				var resultTableDiv = $('.result-div .result.table');
				var dataTable = resultTableDiv.find('.table-div');
				var year = dataset.Year;
				var months = dataset.Months
				//
				//reset
				resultTableDiv.addClass("hide");
				dataTable.find('.row-div#trSolarRadiation .cell-div:not(.head), .row-div#trWindSpeed .cell-div:not(.head), .row-div.header:not(.title) .cell-div:not(:first-child)').each(function (i, e) {
					if (!$(e).parent(".row-div").hasClass("header")) {
						$(e).html("&nbsp;-&nbsp;");
					} 
					$(e).addClass("hide");
				})
				//set year row
				dataTable.find(".row-div.header.title .cell-div").text(year);
				//
				//check if solar radiation is one of the choice
				if (!("SolarRadiation" in months[Object.keys(months)[0]])) {
					//is not
					dataTable.find('.row-div#trSolarRadiation').hide();
				}
				else {
					dataTable.find('.row-div#trSolarRadiation').show();
				}
				//check if wind speed is one of the choice
				if (!("WindSpeed" in months[Object.keys(months)[0]])) {
					//is not
					dataTable.find('.row-div#trWindSpeed').hide();
				}
				else {
					dataTable.find('.row-div#trWindSpeed').show();
				}

				for (var month in months) {
					if (!months.hasOwnProperty(month)) {
						continue;
					}
					//process start here
					//
					//hide no data cells
					dataTable.find('.row-div:not(.title)').find('.cell-div:eq(' + util.convertMonth(month) + ')').each(function (i, e) {
						$(e).removeClass("hide");
					})

					//if solarradiation is a choice
					if (("SolarRadiation" in months[month])) {
						//for each month's sr
						dataTable.find('.row-div#trSolarRadiation .cell-div:eq(' + util.convertMonth(month) + ')').text(months[month].SolarRadiation);
					}
					//if windspeed is a choice
					if (("WindSpeed" in months[month])) {
						//for each month's ws
						dataTable.find('.row-div#trWindSpeed .cell-div:eq(' + util.convertMonth(month) + ')').text(months[month].WindSpeed);

					}
				}
				resultTableDiv.removeClass("hide")

			}
		},
		submitForm: {
			init: function () {
				var ip = indexPage;
				var form = $(".form-main-div");
				if (ip.weatherData.submitForm.validate(form)) {
					ip.weatherData.pageLoader.show();
					ip.weatherData.submitForm.processSubmit(function () {
						ip.weatherData.pageLoader.hide();

					});
				}
			},
			validate: function (form) {
				var myRet = true;

				//check weather
				if (form.find("input[name='cbgWeather']:checked").length <= 0) {
					myRet = false;
					form.find("input[name='cbgWeather']").each(function (i, e) {
						$(e).addClass("error");
					})
				}
				else {
					form.find("input[name='cbgWeather']").each(function (i, e) {
						$(e).removeClass("error");
					})
				}


				//check display
				if (form.find("input[name='cbgDisplay']:checked").length <= 0) {
					myRet = false;
					form.find("input[name='cbgDisplay']").each(function (i, e) {
						$(e).addClass("error");
					})
				}
				else {
					form.find("input[name='cbgDisplay']").each(function (i, e) {
						$(e).removeClass("error");
					})
				}

				//check dates
				form.find("input[type='text']").each(function (i, e) {
					if ($.trim($(e).val()) == "") {
						myRet = false;
						$(e).addClass("error");
					}
					else {
						$(e).removeClass("error");
					}
				})

				if (!myRet) {
					form.siblings(".form-message").text("Error: Please check the fields in red!");
					form.siblings(".form-message").slideDown("fast", function () {
						$("html, body").animate({ scrollTop: $('.form-message').offset().top }, 1000);
					});
				}
				else {
					form.siblings(".form-message").slideUp();
					form.siblings(".form-message").text("");
				}


				return myRet;
			},
			processSubmit: function (onComplete) {
				//
				var ip = indexPage;
				//
				var myWeatherData = [], myDisplayFormat = [];
				var myMonthFrom, myMonthTo;
				//
				$("input[name='cbgWeather']").each(function (i, e) {
					if ($(e).is(":checked")) {
						myWeatherData.push($(e).val());
					}
				})
				$("input[name='cbgDisplay']").each(function (i, e) {
					if ($(e).is(":checked")) {
						myDisplayFormat.push($(e).val());
					}
				})
				myMonthFrom = $("#txtMonthFrom").val().substring(0, 3)
				myMonthTo = $("#txtMonthTo").val().substring(0, 3);
				//
				$.ajax({
					async: true,
					type: 'POST',
					data: {
						weatherData: JSON.stringify(myWeatherData),
						displayFormat: JSON.stringify(myDisplayFormat),
						year: $("#txtYear").val(),
						monthFrom: myMonthFrom,
						monthTo: myMonthTo
					},
					dataType: 'json',
					url: '../getWeatherData',
					success: function (output, textStatus, jqXHR) {
						var responseData = output;
						console.log(responseData)
						//
						ip.weatherData.processData.init(responseData, myMonthFrom, myMonthTo);

					},
					error: function (jqXHR, textStatus, errorThrown) {
						console.log(jqXHR.responseText);
						form.siblings(".form-message").text("Error retrieving the requested data, please try again later!");
						form.siblings(".form-message").slideDown("fast", function () {
							$("html, body").animate({ scrollTop: $('.form-message').offset().top }, 1000);
						});
						ip.weatherData.pageLoader.hide();
					},
					complete: function (jqXHR, textStatus) {
						if (onComplete) { onComplete() }
					}
				});
			}

		},
		util: {
			//convert textual month to the numeral form string or vice versa
			convertMonth: function (month) {
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
		}
	}
}


//---- document ready -------------------------
$(document).ready(function () {
	indexPage.init(function () { });
});

