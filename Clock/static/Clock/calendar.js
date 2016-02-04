function numberOfDays(mm, yyyy) {
	var daysofmonth = 0;
	if ((mm == 3) || (mm == 5) || (mm == 8) || (mm == 10)){
		daysofmonth = 30;
	} 
	else{
		daysofmonth = 31;
		if (mm == 1){
			if (yyyy / 4 - parseInt(yyyy / 4) != 0){
				daysofmonth = 28;
			} 
			else{
				if (yyyy / 100 - parseInt(yyyy / 100) != 0){
					daysofmonth = 29;
				} 
				else{
					if(yyyy / 400-parseInt(yyyy / 400) != 0){
						daysofmonth = 28;
					} 
					else{
						daysofmonth = 29;
					};
				};
			};
		};
	};
	return daysofmonth;
};

function firstDayOfMonth(month, year){
	var date = new Date(year,month,1,0,0,0,0);
	return date.getDay();
}

function makeTimeMenu(){
	var minutes_list = ["00","15","30","45"]
	var timeOfDay = ["AM", "PM"]
	
	for( var hour = 1; hour<13; hour++){
		$("#start_hour").append( "<option value="+hour+">"+hour+"</option>" )
		$("#end_hour").append( "<option value="+hour+">"+hour+"</option>" )
	}
	for( var minute=0; minute<4;minute++){
		$("#start_minute").append( "<option value="+minutes_list[minute]+">"+minutes_list[minute]+"</option>" )
		$("#end_minute").append( "<option value="+minutes_list[minute]+">"+minutes_list[minute]+"</option>" )
	}
	for( var period = 0; period<2; period++){
		$("#start_am").append( "<option value="+timeOfDay[period]+">"+timeOfDay[period]+"</option>" )
		$("#end_am").append( "<option value="+timeOfDay[period]+">"+timeOfDay[period]+"</option>" )
	}
}

function calendarHoverText(times){
	var current_calendar_box = "";
	for(hours in times){
		if(hours > 0){
			current_calendar_box += " and \n"
		}
		//24 hr to 12 hr conversion
		if (times[hours]["clock_in"].getHours() > 12){
			current_calendar_box += (times[hours]["clock_in"].getHours()-12)+":"
		}
		else{
			current_calendar_box += times[hours]["clock_in"].getHours()+":"
		}
		// makes :00 display properly
		if (times[hours]["clock_in"].getMinutes() == 0){
			current_calendar_box += "00"
		}
		else{
			current_calendar_box += times[hours]["clock_in"].getMinutes()
		}
		// Add AM or PM
		if (times[hours]["clock_in"].getHours() > 12){
			current_calendar_box += " PM to "
		}
		else{
			current_calendar_box += " AM to "
		}

		//Repeat for end times
		if (times[hours]["clock_out"].getHours() > 12){
			current_calendar_box += (times[hours]["clock_out"].getHours()-12)+":"
		}
		else{
			current_calendar_box += times[hours]["clock_out"].getHours()+":"
		}
		if (times[hours]["clock_out"].getMinutes() == 0){
			current_calendar_box += "00"
		}
		else{
			current_calendar_box += times[hours]["clock_out"].getMinutes()
		}
		if (times[hours]["clock_out"].getHours() > 12){
			current_calendar_box += " PM"
		}
		else{
			current_calendar_box += " AM"
		}

	}
	return current_calendar_box;
}

$(document).ready(function(){

	function getDays(callback, calender_type){
		/**
		Calendar Types:
		1. All users
		2. Specific user
		3. Current user and TA's
		**/
		'use strict';
		$.get("/days/" ,function(data){
			$.get("/employee_data/" ,function(employee_data){
				var days_working = [];
				if (data["result"]==true){
					for (var i =0; i<data["output"].length; i++){
						var clock_in = new Date(data["output"][i]["clock_in"]);
						var clock_out = new Date(data["output"][i]["clock_out"]);
						clock_in.setHours(clock_in.getHours()+parseInt(clock_in.getTimezoneOffset()/60))
						clock_out.setHours(clock_out.getHours()+parseInt(clock_out.getTimezoneOffset()/60))
						var new_day_entry = {"clock_in":clock_in,"clock_out":clock_out, "id":data["output"][i]["id"], "user_id":data["output"][i]["employeeid"] , "color":data["output"][i]["color"]  };

						days_working.push(new_day_entry);
					}
				}
				var employeeinfo = {}
				if (employee_data["result"] == true ){
					// console.log(employee_data["output"])
					employeeinfo = employee_data["output"]
				}
				// console.log(employeeinfo)
				callback(days_working, employeeinfo)
			});
		});
	};

	function displayCalendar(){
		getDays(function(days_working, employeeinfo) {

			var displaytype = $("#type").data("type")
			var user_id = $("#type").data("userid")

			// body...
			var old_current_date = new Date();
			current_date = new Date( old_current_date.getFullYear(), old_current_date.getMonth(), old_current_date.getDate(),0,0,0 )
			var monthlist = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
			"Aug", "Sep", "Oct", "Nov", "Dec" ];
			var daylist = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

			$("#month_header").html(monthlist[sessionStorage.month] + " " + sessionStorage.year);
			
			var calendar_output = "<tr>"
			for (var i = 0; i<daylist.length;i++){
				calendar_output += "<td class='daynames'><b>"+ daylist[i] +"</b></td>";
			}
			calendar_output += "</tr>";

			// How many dates have been placed on the calendar
			var month_length = numberOfDays(sessionStorage.month, sessionStorage.year);
			var start_day = firstDayOfMonth(sessionStorage.month, sessionStorage.year);
			var daycount = 0;
			var weeks_this_month = [];
			var current_week = { "daysWorking":[], "timeRange":{}};
			var week_count = 0;

			calendar_output += "<tr>";

			var firstOfMonth = new Date(sessionStorage.year, sessionStorage.month, 1, 0,0,0,0 );
			var firstSaturday = new Date( firstOfMonth.setDate( firstOfMonth.getDate()-( start_day+1 ) ) );
			current_week["timeRange"]["startTime"] = firstSaturday
			// console.log(firstSaturday)
			// console.log(days_working)

			if(start_day != 6){
				for(var work_day in days_working){
					var temp_work_day = new Date(days_working[work_day]["clock_in"].getFullYear(), days_working[work_day]["clock_in"].getMonth(), days_working[work_day]["clock_in"].getDate(),0,0,0);
					
					if ( temp_work_day.getTime() === firstSaturday.getTime()){
						current_week["daysWorking"].push(days_working[work_day]);
					}
				}
			}
			// console.log(current_week)

			for (var i = 1; i<8; i++){

				//days during the month
				if (i > start_day){
					daycount++
					var tempdate = new Date(sessionStorage.year, sessionStorage.month, daycount, 0,0,0,0 );
					var current_calendar_box = "<td class='date' valign=middle ";
					var current_user_working = false;
					var is_today = false;
					var is_working = false;
					var times = [];

					for(var work_day in days_working){
						var temp_work_day = new Date(days_working[work_day]["clock_in"].getFullYear(), days_working[work_day]["clock_in"].getMonth(), days_working[work_day]["clock_in"].getDate(),0,0,0)

						if ( temp_work_day.getTime() === tempdate.getTime()){
							is_working = true;
							current_week["daysWorking"].push(days_working[work_day]);
							if(user_id == days_working[work_day]["user_id"]){
								times.push(days_working[work_day]);
								current_user_working = true
							}
						}
					}
					if(tempdate.getDay() == 5){
						current_week["timeRange"]["endTime"]=tempdate
						weeks_this_month.push(current_week)
						week_count++;
						current_week = { "daysWorking":[], "timeRange":{}};
						tomorrow = new Date()
						tomorrow = new Date(tomorrow.setDate(tempdate.getDate()+1))
						current_week["timeRange"]["startTime"]=tomorrow
					}

					if( tempdate.getTime() === current_date.getTime()){
						is_today = true;
					}

					// console.log(days_working[work_day]["color"])
					if(is_working==true){
						current_calendar_box += "style='background-color:"
						if(current_user_working == true){
							current_calendar_box += "red'"
							current_calendar_box += "title='You are working from \n ";
							current_calendar_box += calendarHoverText(times);
						}
						else{
							current_calendar_box += days_working[work_day]["color"]+"' "
						}
						if(is_today==true){
							current_calendar_box +="'>*"+daycount+"*<br></td>";
						}
						else{
							current_calendar_box +="'>"+daycount+"<br></td>";
						}
					}
					else{
						if(is_today==true){
							current_calendar_box +="'>*"+daycount+"*<br></td>";
						}
						else{
							current_calendar_box +="'>"+daycount+"<br></td>";
						}
					}

					calendar_output += current_calendar_box;
				}

				//days before the month
				else{
					var firstOfMonth = new Date(sessionStorage.year, sessionStorage.month, 1, 0,0,0,0 );
					var previousMonthDay = new Date( firstOfMonth.setDate( firstOfMonth.getDate()-( start_day+1 )+i ) );
					calendar_output += "<td class='date' style='color:grey' >"+ previousMonthDay.getDate() +"</td>";

					for(var work_day in days_working){
						var temp_previous_month_work_day = new Date(days_working[work_day]["clock_in"].getFullYear(), days_working[work_day]["clock_in"].getMonth(), days_working[work_day]["clock_in"].getDate(),0,0,0)

						if ( temp_previous_month_work_day.getTime() === previousMonthDay.getTime()){
							current_week["daysWorking"].push(days_working[work_day]);
						}
					}

					if(previousMonthDay.getDay() == 5){
						current_week["timeRange"]["endTime"]=previousMonthDay
						weeks_this_month.push(current_week)
						week_count++;
						current_week = { "daysWorking":[], "timeRange":{}};
						var firstOfMonth = new Date(sessionStorage.year, sessionStorage.month, 1, 0,0,0,0 );
						current_week["timeRange"]["startTime"]=firstOfMonth;
					}

				}
			}
			calendar_output += "</tr>";
			while ( daycount < month_length ){
				var endDay = 0;
				calendar_output += "<tr>";
				for (var i = 0; i<7; i++){
					if (daycount < month_length){
						daycount++;
						var tempdate = new Date(sessionStorage.year, sessionStorage.month, daycount, 0,0,0,0 );

						var current_calendar_box = "<td class='date' valign=middle ";
						var current_user_working = false;
						var is_today = false;
						var is_working = false;
						var times = [];

						for(var work_day in days_working){
							var temp_work_day = new Date(days_working[work_day]["clock_in"].getFullYear(), days_working[work_day]["clock_in"].getMonth(), days_working[work_day]["clock_in"].getDate(),0,0,0)

							if ( temp_work_day.getTime() === tempdate.getTime()){
								is_working = true;
								current_week["daysWorking"].push(days_working[work_day]);
								if(user_id == days_working[work_day]["user_id"]){
									times.push(days_working[work_day]);
									current_user_working = true
								}
							}
						}
						if(tempdate.getDay() == 5){
							current_week["timeRange"]["endTime"]=tempdate
							weeks_this_month.push(current_week)
							week_count++;
							current_week = { "daysWorking":[], "timeRange":{}};
							tomorrow = new Date()
							tomorrow = new Date(tomorrow.setDate(tempdate.getDate()+1))
							current_week["timeRange"]["startTime"]=tomorrow
						}

						if( tempdate.getTime() === current_date.getTime()){
							is_today = true;
						}
						if(is_working==true){
							current_calendar_box += "style='background-color:"
							if(current_user_working == true){
								current_calendar_box += "red'"
								current_calendar_box += "title='You are working from \n ";
								current_calendar_box += calendarHoverText(times);
							}
							else{
								current_calendar_box += days_working[work_day]["color"]+"' "
							}
							if(is_today==true){
							current_calendar_box +="'>*"+daycount+"*<br></td>";
							}
							else{
								current_calendar_box +="'>"+daycount+"<br></td>";
							}
						}
						else{
							if(is_today==true){
								current_calendar_box +="'>*"+daycount+"*<br></td>";
							}
							else{
								current_calendar_box +="'>"+daycount+"<br></td>";
							}
						}
						calendar_output += current_calendar_box;
						endDay=i;
					}

					//After all days
					else{
						var nextMonth = new Date( sessionStorage.year, sessionStorage.month+1, i-endDay, 0,0,0,0 )
						calendar_output += "<td class='date' style='color:grey'>"+ nextMonth.getDate() +"</td>";

						if( nextMonth.getDay()!=6){
							for(var work_day in days_working){
								var next_month_work_day = new Date(days_working[work_day]["clock_in"].getFullYear(), days_working[work_day]["clock_in"].getMonth(), days_working[work_day]["clock_in"].getDate(),0,0,0)

								if ( next_month_work_day.getTime() === nextMonth.getTime()){
									console.log(current_week)
									console.log(week_count)
									current_week["daysWorking"].push(days_working[work_day]);
								}
							}

							if(nextMonth.getDay() == 5){
								current_week["timeRange"]["endTime"]=tempdate
								weeks_this_month.push(current_week)
								
							}
						}
					}
				}
				calendar_output += "</tr>";
			}
			
			//output calendar days
			$("#maincalendar").html(calendar_output);

			$(".date").css("width","8%").css("border","1px solid black");
			$(".date").css("height", $(".date").css("width")  );
			$(".daynames").css("width","8%").css("border","1px solid black");
			// console.log(weeks_this_month)
			workWeeks(weeks_this_month, employeeinfo)
		})
	}
	
	function workWeeks(weeks_of_the_month, employeeinfo){
		var daylist = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
		var output = ""
		for(week in weeks_of_the_month){
			var hours_this_week = 0;
			output += "<div id=week"+( parseInt(week)+1 )+">"
			output += "<b  style='font-size:1.5vw'>Week "+( parseInt(week)+1 )+" from "+ dateObjectToDateString(weeks_of_the_month[week]["timeRange"]["startTime"])+ " to " + dateObjectToDateString(weeks_of_the_month[week]["timeRange"]["endTime"])+":</b>";
			output += "<ul>";
			for( workTime in weeks_of_the_month[week]["daysWorking"] ){
				output += "<li style='font-size:1.25vw'>"+ daylist[weeks_of_the_month[week]["daysWorking"][workTime].clock_in.getDay()] + " from " +dateObjectToTimeString(weeks_of_the_month[week]["daysWorking"][workTime].clock_in)+" to "+ dateObjectToTimeString(weeks_of_the_month[week]["daysWorking"][workTime].clock_out)+"  ";
				output += "<a id='deletetime' data-id='"+ weeks_of_the_month[week]["daysWorking"][workTime]["id"] +"' href='#' onClick='return false;' > delete </a></li>"
				// console.log( (weeks_of_the_month[week]["daysWorking"][workTime].clock_out - weeks_of_the_month[week]["daysWorking"][workTime].clock_in)/3600000 )
				hours_this_week += Math.abs((weeks_of_the_month[week]["daysWorking"][workTime].clock_out - weeks_of_the_month[week]["daysWorking"][workTime].clock_in)/3600000)
				// console.log(weeks_of_the_month[week]["daysWorking"][workTime]["id"]);
			};
			if (employeeinfo.max_hours < hours_this_week){
				output += "<b style='color:red;font-size:1.25vw'> "
			}
			else{
				output += "<b style='font-size:1.25vw'> "
			}
			output += + hours_this_week + " hours / " + employeeinfo.max_hours +" hours per week </b></ul>"
			// console.log(hours_this_week)
			output += "</div>";
			// console.log(output)
		}
		$("#weeksworking").html(output);
	};

	function dateObjectToDateString(day){
		var monthlist = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
		return ( monthlist[day.getMonth()]+" "+ day.getDate() + " " + day.getFullYear());
	}

	function dateObjectToTimeString(day){
		var Hours = day.getHours();
		var Minutes = day.getMinutes();
		var AM = "AM";
		if( Hours > 12){
			AM = "PM";
			Hours -= 12
		}
		if (Minutes == 0){
			Minutes = "00"
		}
		return Hours+":"+Minutes+" "+AM
	}

	var tempdate = new Date();
	sessionStorage.month = tempdate.getMonth();
	sessionStorage.year = tempdate.getFullYear();
	displayCalendar();


	$("#weeksworking").on("click", "#deletetime", function(event){
		if($(this).data("id")){
			var dayID = {"id":$(this).data("id")};
			$.post("/delete/", dayID ,function(data){
				if (data["result"] == true){
					displayCalendar();
				}
				// console.log("PING")
			});
		}
	});


	$("#maincalendar").on("click", ".date", function(event){
		if( $(this).html() == ""){
			// console.log("pong")
			$("#timeselectordiv").remove();
		}
		if( $(this).html() != ""  ){
			if ( !(event.target.matches(".no_close") || event.target.matches("#scheduleHours") ) ){
				$("#timeselectordiv").remove();
				var box_left = $(this).offset().left + parseInt($(this).css("width").slice(0,-2));
				var box_top = $(this).offset().top + parseInt($(this).css("height").slice(0,-2));
				$(this).append(
					"<div id='timeselectordiv' > <div id='errormessage'></div>"+
						"Start Time: <select id='start_hour' class='no_close'></select><select id='start_minute' class='no_close'></select><select id='start_am' class='no_close'></select><br>"+
						"End Time: <select id='end_hour' class='no_close'></select><select id='end_minute' class='no_close'></select><select id='end_am' class='no_close'></select><br>"+
						"<button type='button' id='scheduleHours'>Submit</button>"+
					"</div>");
				$("#timeselectordiv").css("position","absolute").css("left",box_left).css("top",box_top).css("z-index",5).css("border","solid black 2px").css("background-color","white")
				makeTimeMenu();
			}
		}
	});

	$("#maincalendar").on("click", "#scheduleHours", function(event){
		//get the day to add the hours too by getting the html of the closest date class, taking the first 2 characters, removing any <, and parsing it to an int
		var date = parseInt($(this).closest(".date").html().slice(0,2).replace("<",""));
		var startHour = $("#start_hour").val();
		var endHour = $("#end_hour").val();
		var startMinute = $("#start_minute").val();
		var endMinute = $("#end_minute").val();
		var startAM = $("#start_am").val();
		var endAM = $("#end_am").val();
		if( startAM > endAM){
			var tempHour = startHour;
			var tempMinute = startMinute;
			var tempAM = startAM;

			startHour = endHour;
			startMinute = endMinute;
			startAM = endAM;

			endHour = tempHour;
			endMinute = tempMinute;
			endAM = tempAM;
		}
		else if(startAM == endAM){
			if( startHour > endHour ){
				var tempHour = startHour;
				var tempMinute = startMinute;
				var tempAM = startAM;

				startHour = endHour;
				startMinute = endMinute;
				startAM = endAM;

				endHour = tempHour;
				endMinute = tempMinute;
				endAM = tempAM;
			}
			else if( startHour == endHour && startMinute > endMinute){
				var tempHour = startHour;
				var tempMinute = startMinute;
				var tempAM = startAM;

				startHour = endHour;
				startMinute = endMinute;
				startAM = endAM;

				endHour = tempHour;
				endMinute = tempMinute;
				endAM = tempAM;
			}
		}

		
		var dateserialized = {
			"startday":date,
			"startmonth":(parseInt(sessionStorage.month)+1), 
			"startyear":parseInt(sessionStorage.year),
			"endday":date,
			"endmonth":(parseInt(sessionStorage.month)+1),
			"endyear":parseInt(sessionStorage.year),
			"starttime":startHour+":"+startMinute,
			"startam":startAM,
			"endtime":endHour+":"+endMinute,
			"endam":endAM,
		};
		$.post("/punchtimes/", dateserialized ,function(data){
			console.log(data);
			if(data["result"] == false){
				console.log("PING")
				console.log(data["message"])
				$("#errormessage").html(data["message"])
			}
			else{
				displayCalendar();
			}
		});
	});

	$("#previous_month").on("click",function(event){
		event.preventDefault();
		if( sessionStorage.month == 0){
			sessionStorage.year--;
			sessionStorage.month = 11;
		}
		else{
			sessionStorage.month--;
		}
		displayCalendar();
		console.log(1)
	});

	$("#next_month").on("click",function(event){
		event.preventDefault();
		if( sessionStorage.month == 11){
			sessionStorage.year++;
			sessionStorage.month = 0;
		}
		else{
			sessionStorage.month++;
		}
		displayCalendar();
		console.log(2)
	});
	// Remove time slector box if not clicking on it
	$("body").on("click", function(event){
		// event.stopPropagation();
		if( event.target.matches("#timeselectordiv") || event.target.matches(".date") || event.target.matches(".no_close")  || event.target.matches("#scheduleHours")){}
		else{
			$("#timeselectordiv").remove();
		}
	});

});