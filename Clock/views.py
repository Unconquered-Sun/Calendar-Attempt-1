from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from .models import NewUserTokens, Employee, PunchTimes, EmployeeType
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.views.generic import View
from django.core import serializers
from datetime import timedelta
from Clock.models import PunchTimes
import datetime
import random
import string
import pytz
# Create your views here.

def daterange(start_date, end_date):
	end_date += datetime.timedelta(days=1)
	for n in range(int ((end_date - start_date).days)):
		yield start_date + timedelta(n)

class ClockIn(View):

	def get(self, request):
		return render(request, "Clock/punch_clock.html")

	def post(self, request):
		print(request.POST)
		if "id" in request.session:
			if request.session["id"] != None:
				user = User.objects.get(id=request.session["id"])
				if user:
					start_day = datetime.date( int(request.POST["startyear"]), int(request.POST["startmonth"]), int(request.POST["startday"]) )
					end_day = datetime.date( int(request.POST["endyear"]), int(request.POST["endmonth"]), int(request.POST["endday"]) )
					
					print("Start Weekday")
					print(start_day.weekday())

					if start_day.weekday() == 5:
						print(0)
						first_saturday = start_day
					elif start_day.weekday() == 6:
						print(1)
						first_saturday = start_day - timedelta(days=1)
					else:
						first_saturday = start_day - timedelta(days=(start_day.weekday()+2))
					

					if end_day.weekday() == 5:
						last_friday = end_day + timedelta(days=6)
					elif end_day.weekday() == 6:
						last_friday = end_day + timedelta(days=5)
					else:
						last_friday = end_day + timedelta(days=(4-end_day.weekday()))
					

					# last_friday = end_day + timedelta(days=(4-end_day.weekday()))

					week_collection = []
					current_week = {}
					current_day = first_saturday;

					while current_day < last_friday:
						current_week = {}
						current_week["start"] = current_day
						current_week["end"]=current_day + timedelta(days=6)
						week_collection.append(current_week)
						current_day = current_week["end"] + timedelta(days=1)

					weeks_as_days = []

					for week in week_collection:

						tempweeks = []
						for single_day in daterange(week["start"], week["end"]):
							tempweeks.append(single_day)
						weeks_as_days.append(tempweeks)
					
					punchtimes = user.employee.punchtimes_set.all()
					current_employeee = user.employee
					
					weekly_hours = []
					for week in weeks_as_days: # Adds the hours of all workdays in each week and stores it in weekly_hours
						temp_hours = 0
						for day in week:
							for punch in punchtimes:
								temppunch = punch.clock_in.date()
								if day == temppunch:
									temp_hours += int( abs((punch.clock_out-punch.clock_in).seconds/3600) )
						weekly_hours.append(temp_hours)
					
					if request.POST["startam"] == "AM":
						start_time = datetime.time( int(request.POST["starttime"].split(":")[0]) , int(request.POST["starttime"].split(":")[1])  )
					else:
						start_time = datetime.time( int(request.POST["starttime"].split(":")[0])+12 , int(request.POST["starttime"].split(":")[1])  )
					
					if request.POST["endam"] == "AM":
						end_time = datetime.time( int(request.POST["endtime"].split(":")[0]) , int(request.POST["endtime"].split(":")[1])  )
					else:
						end_time = datetime.time( int(request.POST["endtime"].split(":")[0])+12 , int(request.POST["endtime"].split(":")[1])  )
					
					weeks_overtime = []
					date_counter = start_day
					hour_index = 0
					no_conflicts = True #if still true after everything then the days will be added to the schedule
					while date_counter <= end_day:
						next_friday = date_counter
						if date_counter.weekday() == 5:
							next_friday = date_counter + timedelta(days=6)
						elif date_counter.weekday() == 6:
							next_friday = date_counter + timedelta(days=5)
						else:
							next_friday = date_counter + timedelta(days=(4-end_day.weekday()))
						print("next friday")
						print(next_friday)

						if end_day <= next_friday:
							end_point = end_day
						else:
							end_point = next_friday
						#loops over the 
						print("Weekly Hours")
						print(weekly_hours)
						for single_day in daterange(date_counter, end_point):
							temp_start = datetime.datetime.combine(single_day, start_time)
							temp_end = datetime.datetime.combine(single_day, end_time)
							weekly_hours[hour_index] += int( ( temp_end - temp_start ).seconds/3600)
						
						#sets start day to the next saturday
						date_counter = next_friday + timedelta(days=1)
						hour_index += 1
						weekly_hours.append(0)

					user_employee = user.employee;
					for week in range(len(weekly_hours)):
						if weekly_hours[week] > user_employee.max_hours:
							no_conflicts = False
							weeks_overtime.append(week_collection[week])

					print(weekly_hours)
					print("overtime start")
					print(weeks_overtime)
					print("overtime end")

					success = False
					if no_conflicts == True:
						i = 1
						for single_day in daterange(start_day, end_day):
							temp_start_daytime = pytz.utc.localize( datetime.datetime.combine(single_day, start_time) )
							temp_end_daytime = pytz.utc.localize( datetime.datetime.combine(single_day, end_time) )
							i += 1

							scheduleValid = True
							clash_type = ""
							clash_list = []
							for work_time_range in punchtimes:
								if( work_time_range.clock_in < temp_start_daytime and temp_start_daytime < work_time_range.clock_out):
									#Conflicts with another schedule
									scheduleValid = False
									clash_type = "1"
									clash_list.append(work_time_range)
								if( work_time_range.clock_in < temp_end_daytime and temp_end_daytime < work_time_range.clock_out):
									#Conflicts with another schedule
									scheduleValid = False
									clash_type = "2"
								if( temp_start_daytime < work_time_range.clock_in and work_time_range.clock_in < temp_end_daytime and temp_end_daytime >= temp_start_daytime):
									scheduleValid = False
									clash_type = "3"
								if( temp_start_daytime < work_time_range.clock_out and work_time_range.clock_out < temp_end_daytime and temp_end_daytime >= temp_start_daytime):
									scheduleValid = False
									clash_type = "4"
												

							if scheduleValid == True:
								newScheduledDay = PunchTimes(clock_in=temp_start_daytime, clock_out=temp_end_daytime, employee=user.employee)
								newScheduledDay.save()
								success = True
							else:
								print("Clashes with a schedule")
								print("Clash Type: "+ clash_type)
								for i in clash_list:
									print(i.clock_in)

					if success == True and no_conflicts == True:
						return JsonResponse( {"result":True} )
					elif success == False and no_conflicts == False:
						return JsonResponse( {"result":False, "message":"Too many hours"} )
					elif success == False and no_conflicts == True:
						return JsonResponse( {"result":False, "message":"Overlap with previously schedules hours"} )
					else:
						return JsonResponse( {"result":False, "message":"Who knows what went wrong"} )
		return redirect("Login")
		
class CreateUser(View):

	def get(self, request):
		if "token" in request.GET:
			result = NewUserTokens.objects.filter(token=request.GET['token']).exists()
			if result:
				return render(request, "Clock/createuser.html", {"forms": UserCreationForm(), "token":request.GET['token']  })
			else:
				return redirect("Login")
		else:
			return redirect("Login")

	def post(self, request):
		if "token" in request.POST:
			result = NewUserTokens.objects.filter(token=request.POST['token']).exists()
			if result:
				token = NewUserTokens.objects.get(token=request.POST['token'])
				print(token)
				tempform = UserCreationForm(request.POST)
				print(tempform)
				if tempform.is_valid():
					print("PING")
					user = tempform.save()
					employee = Employee(max_hours=int(token.token[-2:]), user=user, admin=False, employeeType=EmployeeType.objects.filter(id=1)[0])
					employee.save()
					token.delete()
					return render(request, "Clock/index.html", {'admin':"False"})
				else:
					return render(request, "Clock/createuser.html", {"forms": UserCreationForm(request.POST), "token":request.POST['token']  })
			else:
				return render(request, "Clock/createuser.html", {"forms": UserCreationForm(request.POST), "token":request.POST['token']  })
		return redirect("Login")

class Login(View):

	def get(self,request):
		if "id" in request.session:
			if request.session["id"] != None:
				user = User.objects.get(id=request.session["id"])
				if user.employee.admin:
					return render(request, "Clock/index.html", {'admin':"True", "type":1, "id":user.id})
				else:
					return render(request, "Clock/index.html", {'admin':"False", "type":1, "id":user.id})
		return render(request, "Clock/login.html",{'forms':AuthenticationForm()})


	def post(self, request):
		username = request.POST['username']
		password = request.POST['password']
		user = authenticate(username=username, password=password)
		if user:
			if user.is_active:
				request.session["id"]= user.id
				if user.employee.admin:
					return render(request, "Clock/index.html", {'admin':"True", "type":1, "id":user.id})
				else:
					return render(request, "Clock/index.html", {'admin':"False", "type":1, "id":user.id})
		return render(request, "Clock/login.html",{'forms':AuthenticationForm(request.POST) } )

class CreateUserLink(View):

	def get(self, request):
		user = User.objects.get(id=request.session["id"])
		if user:
			if user.employee.admin:
				return render(request, "Clock/createlink.html")
		return render(request, "Clock/index.html")

	def post(self, request):
		pass

class GetWorkingDays(View):

	def get(self, request):
		if "id" in request.session:
			if request.session["id"] != None:
				user = User.objects.get(id=request.session["id"])
				if user.employee:
					# punchtimes = user.employee.punchtimes_set.all()
					punchtimes = PunchTimes.objects.all()
					day_serialized = {"result":True, "output":[]}
					for day in punchtimes:
						startAM = "AM"
						endAM = ""
						if day.clock_in.hour > 12:
							startAM = "PM"
						if day.clock_out.hour > 12:
							endAM = "PM"
						day_serialized["output"].append({
							"clock_in":day.clock_in.isoformat(" "),
							"clock_out":day.clock_out.isoformat(" "),
							"id":day.id,
							"employeetype":day.employee.employeeType.name,
							"color":day.employee.employeeType.color,
							"employeeid":day.employee.user.id,
							})

					print(day_serialized)
					return JsonResponse( day_serialized )
		return JsonResponse( {"result":False} )

class DeleteWorkingDay(View):

	def get(self, request):
		return redirect("Login")

	def post(self, request):
		print(request.POST)
		if "id" in request.session:
			if request.session["id"] != None:
				user = User.objects.get(id=request.session["id"])
				if user.employee:
					punchtime = user.employee.punchtimes_set.filter(id=request.POST["id"])
					punchtimeresult = user.employee.punchtimes_set.filter(id=request.POST["id"]).exists()
					if punchtimeresult:
						punchtime.delete()
						return JsonResponse({"result":True})
		return JsonResponse({"result":False})

class GetEmployeeInfo(View):

	def get(self, request):
		if "id" in request.session:
			if request.session["id"] != None:
				user = User.objects.get(id=request.session["id"])
				if user.employee:
					user_employee = user.employee
					print(user_employee)
					employee_serialized = {
						"max_hours":user_employee.max_hours,
						"admin":user_employee.admin,
					}
					return JsonResponse({"result":True, "output":employee_serialized})
		return JsonResponse({"result":False})


class Admin(View):

	def get(self, request):
		if "id" in request.session:
			if request.session["id"] != None:
				user = User.objects.get(id=request.session["id"])
				print("Employee Admin Test")
				print(user.employee.admin)
				if user.employee.admin == True:
					return render(request, "Clock/admin.html", {'admin':"True"})
		return redirect("Login")

class Logout(View):

	def get(self, request):
		if "id" in request.session:
			if request.session["id"] != None:
				request.session["id"] = None
		return redirect("Login")

class UserList(View):

	def get(self, request):
		if "id" in request.session:
			if request.session["id"] != None:
				user = User.objects.get(id=request.session["id"])
				if user.employee:
					if user.employee.admin == True:
						user_list = User.objects.all()
						user_list_serialized = []
						for specific_user in user_list:
							temp_serialized = {
								"firstName":specific_user.first_name,
								"lastName":specific_user.last_name,
								"id":specific_user.id,
								"employeeType":specific_user.employee.employeeType.name,
								"color":specific_user.employee.employeeType.color,
								"maxHours":specific_user.employee.max_hours,
							}
							user_list_serialized.append(temp_serialized)
						return render(request, "Clock/userlist.html", {"result":True, "output":user_list_serialized})
		return JsonResponse({"result":False})

class UserToken(View):

	def get(self, request):
		if "id" in request.session:
			if request.session["id"] != None:
				user = User.objects.get(id=request.session["id"])
				if user.employee:
					if user.employee.admin == True:
						return render(request, "Clock/usertoken.html")

	def post(self, request):
		print(request.POST)

		try:
			tempInt = int(request.POST["hours"])
		except ValueError:
			tempInt = None

		if request.POST["lastname"] and request.POST["firstname"] and tempInt:
			token = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(14))
			token += str(tempInt)
			tokenObject = NewUserTokens.create(token=token, firstname=request.POST["firstname"], lastname=request.POST["lastname"])
			if tokenObject:
				tokenObject.save()
				return render(request, "Clock/finalusertoken.html", {"token":token})
			print(token)
		else:
			return redirect("UserToken")
