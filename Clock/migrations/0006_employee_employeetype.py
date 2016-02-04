# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Clock', '0005_auto_20160114_2222'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee',
            name='employeeType',
            field=models.ForeignKey(default=1, to='Clock.EmployeeType', blank=True),
            preserve_default=False,
        ),
    ]
