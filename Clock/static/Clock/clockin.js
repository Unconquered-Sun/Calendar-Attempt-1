$(document).ready(function(){

	$("#dateselector").on("submit", function(event){
		event.preventDefault();
		var startdate = $( "#start_date" ).datepicker( "getDate" )
		var enddate = $( "#end_date" ).datepicker( "getDate" )
		var starttime = $( "#start_time" ).val();
		var endtime = $( "#end_time" ).val();
		var startam = $("#start_AM").val();
		var endam = $("#end_AM").val();

		var splitstarttime = starttime.split(":");
		var splitendtime = endtime.split(":");
		if(startam == "PM" && endam == "AM"){
			//switch start time and end time
			var temp = starttime;
			starttime = endtime;
			endtime = temp;
			//switch AM/PMs next
			temp = startam;
			startam = endam;
			endam = temp;
		}
		else if(splitstarttime > splitendtime && startam == endam){
			//switch start time and end time
			var temp = starttime;
			starttime = endtime;
			endtime = temp;
			//switch AM/PMs next
			temp = startam;
			startam = endam;
			endam = temp;
		}
		//if everything has a value submit the form
		if(startdate && enddate && starttime && endtime && startam && endam){
			var dateserialized = {
				"startday":startdate.getDate(), 
				"startmonth":startdate.getMonth()+1, 
				"startyear":startdate.getFullYear(),
				"endday":enddate.getDate(),
				"endmonth":enddate.getMonth()+1,
				"endyear":enddate.getFullYear(),
				"starttime":starttime,
				"startam":startam,
				"endtime":endtime,
				"endam":endam,
			}
			$.post("/punchtimes/", dateserialized ,function(data){
				if( "result" in data ){
					if(data["result"] == true){
						window.location.href = "/index/";
					}
					else{
						console.log("PING")
						console.log(data["message"])
						$("#errormessage").html(data["message"])
					}
				}
				

			});
		}
	});

// //This will create a Date with the current date and time
// var today = new Date();

// //This will create a Date 123456 milliseconds after January 1st 1970, the Unix Epoch
// var seconds = new Date(123456)

// //This will create a Date with the date of January 21st 2015 and a time of 11:30 AM
// var datestring = new Date("January 21, 2015 11:30:00")

// //This will create a Date using the constructor (year, month, day, hours, minutes, seconds, milliseconds)
// var day = new Date(2015, 0, 21, 12, 10, 0, 0)



})



