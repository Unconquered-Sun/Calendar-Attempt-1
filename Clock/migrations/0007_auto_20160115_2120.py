# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Clock', '0006_employee_employeetype'),
    ]

    operations = [
        migrations.AddField(
            model_name='newusertokens',
            name='firstname',
            field=models.CharField(max_length=256, default='Matthew'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='newusertokens',
            name='lastname',
            field=models.CharField(max_length=256, default='Test'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='employee',
            name='employeeType',
            field=models.ForeignKey(to='Clock.EmployeeType'),
        ),
    ]
