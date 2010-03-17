# -*- coding: utf-8 -*-
#
# (c) 2009 Christoph Böhme <christoph@b3e.net>
#
# This file is part of Novam.
#
# Novam is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Novam is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Foobar.  If not, see <http://www.gnu.org/licenses/>.

import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from sqlalchemy.sql import expression as sql

import cairo
from pycha.pie import PieChart

from novam.lib.base import BaseController, render
from novam import model
from novam.model.meta import session

log = logging.getLogger(__name__)

class StatsController(BaseController):
	
	def _draw_chart(self, verified_stops, unverified_stops):
		surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, 50, 50)
		dataset = (
			( "Unverified Stops", ((1, unverified_stops),) ),
			( "Verified Stops", ((1, verified_stops),) )
		)

		stylesheet = {
			"legend": {
				"hide": True
			},
			"axis": {
				"x": {
					"hide": True
				}
			},
			"background": {
				"baseColor": "#ffffff"
			},
			"colorScheme": {
				"name": "fixed",
				"args": {
					"colors": ["#a40000", "#4e9a06"]
				}
			},
			"padding": {
				"left": 0,
				"top": 0,
				"bottom": 0,
				"right": 0
			}
			#"pieRadius": 0.5
		}
		
		chart = PieChart(surface, stylesheet)
		chart.addDataset(dataset)
		chart.render()
		surface.write_to_png("test.png")

		response.content_type = "image/png"

		h = open("test.png", "rb")
		return h.read()


	def index(self, format="html"):
		region_query = session.query(model.RegionStats).order_by(model.RegionStats.name)

		c.sub_stats = region_query.all()
		c.sub_level = "Regions"
		c.sub_level_link = "region_stats"
		c.place_name = "UK"

		return render("/default-stats.mako")


	def region_stats(self, region_code, format="html"):
		region = session.query(model.RegionStats).filter_by(code=region_code).one()

		if format == "html":
			area_query = session.query(model.AreaStats)\
				.filter_by(region_code=region_code)\
				.order_by(model.AreaStats.name)

			c.sub_stats = area_query.all()
			c.sub_level = "Areas"
			c.sub_level_link = "area_stats"
			c.place_name = region.name

			return render("/default-stats.mako")

		elif format == "png":
			return self._draw_chart(region.verified_stops, region.unverified_stops)


	def area_stats(self, region_code, area_code, format="html"):
		area = session.query(model.AreaStats).filter_by(code=area_code).one()

		if format == "html":
			district_query = session.query(model.DistrictStats)\
				.filter_by(area_code=area_code)\
				.order_by(model.DistrictStats.name)

			c.sub_stats = district_query.all()
			c.sub_level = "Districts"
			c.sub_level_link = "district_stats"
			c.place_name = area.name

			return render("/default-stats.mako")

		elif format == "png":
			return self._draw_chart(area.verified_stops, area.unverified_stops)


	def district_stats(self, region_code, area_code, district_code, format="html"):
		district = session.query(model.DistrictStats).filter_by(code=district_code).one()

		if format == "html":
			locality_query = session.query(model.LocalityStats)\
				.filter_by(district_code=district_code)\
				.order_by(model.LocalityStats.name)

			c.sub_stats = locality_query.all()
			c.sub_level = "Localities"
			c.sub_level_link = "locality_stats"
			c.place_name = district.name

			return render("/default-stats.mako")

		elif format == "png":
			return self._draw_chart(district.verified_stops, district.unverified_stops)


	def locality_stats(self, region_code, area_code, district_code, locality_code, format="html"):
		locality = session.query(model.LocalityStats).filter_by(code=locality_code).one()

		if format == "html":
			stops_query = session.query(model.Stop).join(model.Tag, (
				model.StopLocation, sql.and_(
					model.StopLocation.atco_code == model.Tag.value, 
					model.Tag.name == "naptan:AtcoCode"
				)
			)).filter(model.StopLocation.locality_code == locality_code)

			c.stops = stops_query.all()
			c.place_name = locality.name
			return render("/locality-stats.mako")

		elif format == "png":
			return self._draw_chart(locality.verified_stops, locality.unverified_stops)
