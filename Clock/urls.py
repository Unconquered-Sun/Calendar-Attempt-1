from django.views.decorators.csrf import csrf_exempt
from django.conf.urls import include, url
from django.contrib import admin
from Clock.views import ClockIn, CreateUser, Login, GetWorkingDays, DeleteWorkingDay, GetEmployeeInfo, Admin, Logout, UserList, UserToken

urlpatterns = [
	url(r'^punchtimes/$', csrf_exempt(ClockIn.as_view()), name='ClockIn'),
	url(r'^createuser/$', CreateUser.as_view(), name='CreateUser'),
	url(r'^login/$', Login.as_view(), name='Login'),
	url(r'^logout/$', Logout.as_view(), name='Logout'),
	url(r'^admin/$', Admin.as_view(), name='AdminMenu'),
	url(r'^index/$', Login.as_view(), name='Index'),
	url(r'^user_list/$', UserList.as_view(), name='UserList'),
	url(r'^user_token/$', csrf_exempt(UserToken.as_view()), name='UserToken'),
	url(r'^delete/$', csrf_exempt(DeleteWorkingDay.as_view()), name='Delete'),
	url(r'^$', Login.as_view(), name='Homepage'),
	url(r'^days/$', GetWorkingDays.as_view(), name='GetDays'),
	url(r'^employee_data/$', GetEmployeeInfo.as_view(), name='GetEmployeeInfo'),
	url(r'^.*/$', Login.as_view(), name='Index'),
]
