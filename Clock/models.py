from django.contrib.auth.models import User
from django.db import models

# Create your models here.
class EmployeeType(models.Model):
	name = models.CharField(max_length=100)
	color = models.CharField(max_length=20)

class Employee(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	max_hours = models.IntegerField()
	admin = models.BooleanField(default=False)
	employeeType = models.ForeignKey(EmployeeType, on_delete=models.CASCADE)

class WorkWeeks(models.Model):
	startDay = models.DateTimeField()
	endDay = models.DateTimeField()
	employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
	hours = models.IntegerField()

class PunchTimes(models.Model):
	clock_in = models.DateTimeField()
	clock_out = models.DateTimeField()
	workweek = models.ForeignKey(WorkWeeks, on_delete=models.CASCADE)

class NewUserTokens(models.Model):
	token = models.CharField(max_length=25)
	firstname = models.CharField(max_length=256)
	lastname = models.CharField(max_length=256)
	
	@classmethod
	def create(cls, token, firstname, lastname):
		usertoken = cls(token=token, firstname=firstname, lastname=lastname)
		return usertoken
