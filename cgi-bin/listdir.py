#!/usr/bin/python

import cgi
import os
import json

print "Content-Type: text/html; charset=UTF-8\n"

form = cgi.FieldStorage()
if "dir" not in form:
    print '{error:"Please specify the dir parameter"}'
    exit

root = os.getcwd()
dir = root + "/" + form.getlist("dir")[0]
contents = os.listdir(dir)
print json.dumps(contents)
