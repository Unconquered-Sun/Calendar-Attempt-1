# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2015-12-16 15:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Clock', '0003_newusertokens'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee',
            name='admin',
            field=models.BooleanField(default=False),
        ),
    ]
