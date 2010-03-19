# -*- coding: utf-8 -*-

from webob import Request, Response
from urllib import urlretrieve
import mimetypes

def handle_request(environ, start_response):
	request = Request(environ)
	if request.path == "/nominatim":
		response = Response(content_type="text/xml; charset=utf-8")
		f = urlretrieve("http://nominatim.openstreetmap.org/?" + request.query_string)[0]
		response.body = open(f, "rb").read()
	elif request.path[:6] == "/xapi/":
		response = Response(content_type="text/xml; charset=utf-8")
		f = urlretrieve("http://xapi.openstreetmap.org/" + request.path[6:])[0]
		response.body = open(f, "rb").read()
	else:
		if request.path == "/":
			filename = "novam/index.html"
		else:
			filename = "novam" + request.path 
		type, encoding = mimetypes.guess_type(filename)
		if type is None:
			type = "text/plain"
		if encoding is None:
			encoding = "utf-8"
		response = Response(content_type=type + "; charset=" + encoding)
		response.body = open(filename, "rb").read()

	return response(environ, start_response)

def app_factory(global_config, **local_conf):
    return handle_request
