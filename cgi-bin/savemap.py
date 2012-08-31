#!/usr/bin/python

import sys
import cgi
import os

print "Content-Type: text/html; charset=UTF-8\n"

form = cgi.FieldStorage()
if "name" not in form:
    print "Please specify map name"
    sys.exit()

if "data" not in form:
    print "Missing map data"
    sys.exit()

root = os.getcwd()
fileName = root + "/data/maps/" + form.getlist("name")[0]
content = form.getlist("data")[0]

file = open(fileName, 'w')
file.write(content)
file.close()
