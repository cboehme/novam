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
		<tr><th>${c.sub_level}</th><th>Verified Stops</th><th>Unverified Stops</th><th></th></tr>
		% for s in c.sub_stats:
			<%
			if c.sub_level_link == "region_stats":
				link = url("region_stats", region_code=s.code)
				img = url("formatted_region_stats", region_code=s.code, format="png")
			elif c.sub_level_link == "area_stats":
				link = url("area_stats", region_code=s.region_code, area_code=s.code)
				img = url("formatted_area_stats", region_code=s.region_code, area_code=s.code, format="png")
			elif c.sub_level_link == "district_stats":
				link = url("district_stats", region_code=s.region_code, area_code=s.area_code, district_code=s.code)
				img = url("formatted_district_stats", region_code=s.region_code, area_code=s.area_code, district_code=s.code, format="png")
			elif c.sub_level_link == "locality_stats":
				link = url("locality_stats", region_code=s.region_code, area_code=s.area_code, district_code=s.district_code, locality_code=s.code)
				img = url("formatted_locality_stats", region_code=s.region_code, area_code=s.area_code, district_code=s.district_code, locality_code=s.code, format="png")
			else:
				link = ""
				img = ""
			%>
			<tr>
				<td><a href="${link}">${s.name}</a></td><td>${s.verified_stops}</td><td>${s.unverified_stops}</td>
				<td><img src="${img}"></td>
			</tr>
		% endfor
	</table>
</body>
</html>
