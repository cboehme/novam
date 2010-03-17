<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

<%!
def add_the(place_name):
	the_places = [
		"UK", 
		"West Midlands", 
		"South East", 
		"East Midlands", 
		"North West", 
		"South West", 
		"North East",
		"East Riding of Yorkshire",
		"Scottish Borders",
		"Western Isles",
		"Isle of Wight"
	]
	if place_name in the_places:
		return "the " + place_name
	else:
		return place_name
%>

<html>
<head>
	<meta http-equiv="Content-type" content="text/html;charset=UTF-8">

	<title>NOVAM-Viewer: Stats</title>

	<link rel="icon" type="image/png" href="/site-icon.png">

	<link rel="stylesheet" href="/base.css" type="text/css">
	<link rel="stylesheet" href="/page.css" type="text/css">
</head>
<body>
	<h1><img src="/logo.png" alt="NOVAM-Logo">NOVAM: Stats</h1>
	<ul id="tools_menu">
		<li><a href="..">Viewer</a></li>
	</ul>
	<h2>Verification Statistics for ${add_the(c.place_name)}</h2>

	<table>
		<tr><th>Atco-Code</th><th>Name</th><th>Is Verified</th></tr>
		% for s in c.stops:
			<%
				link="/?zoom=17&lat=%(lat)f&lon=%(lon)f&stop=%(id)d" % s.__dict__
				
				if "naptan:verified" not in s.tags:
					verified = "Yes"
				else:
					verified = s.tags["naptan:verified"].value
			%>
			<tr><td><a href="${link}">${s.tags["naptan:AtcoCode"].value}</a></td>
			<td>${s.tags["naptan:CommonName"].value}/${s.tags["naptan:Street"].value}</td>
			<td>${verified}</td></tr>
		% endfor
	</table>
</body>
</html>
