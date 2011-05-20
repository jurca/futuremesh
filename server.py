#! /usr/bin/python
import BaseHTTPServer
import CGIHTTPServer
import webbrowser

__author__="develx"
__date__ ="$7.8.2010 18:26:00$"

def main():
    print "Starting up the server..."
    PORT = 8000
    Handler = CGIHTTPServer.CGIHTTPRequestHandler
    httpd = BaseHTTPServer.HTTPServer(("", PORT), Handler)
    webbrowser.open("http://localhost:8000/");
    print "Running at port ", PORT
    print "Hit Ctrl+C to exit"
    httpd.serve_forever()

if __name__ == "__main__":
    main();
