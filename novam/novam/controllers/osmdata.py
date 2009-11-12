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
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Foobar.  If not, see <http://www.gnu.org/licenses/>.

import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from pylons.decorators import jsonify
import sqlalchemy.sql.expression as sql
from xml.sax import parse, SAXException

from novam.lib.base import BaseController, render
from novam import model
from novam.model.meta import session

log = logging.getLogger(__name__)

class OsmdataController(BaseController):

	@jsonify
	def index(self):
		stops_query = session.query(model.Stop)

		if "bbox" in request.GET:
			# Select all bus stops within the bounding box:
			bbox_str = request.GET.get("bbox")
			bbox = bbox_str.split(",")
			stops_query = stops_query.filter(sql.and_(
				model.Stop.lat.between(bbox[1], bbox[3]),
				model.Stop.lon.between(bbox[0], bbox[2])
			))

		if "stop" in request.GET:
			# Select bus stops based on similarity and proximity:
			stop_id = request.GET.get("stop")
			stop = session.query(model.Stop).filter_by(id=stop_id).one()
			
			if "naptan:AtcoCode" in stop.tags and "highway" not in stop.tags:
				# Plain Naptan node, select all OSM nodes in the area:
				stops_query = stops_query.filter(sql.and_(
					sql.func.sqrt(
						sql.func.pow(model.Stop.lat-stop.lat, 2)
						+sql.func.pow(model.Stop.lon-stop.lon, 2)
					) < 0.005,
					model.Stop.id.in_(
						sql.select([model.tags.c.stop_id]).where(model.tags.c.name==u"highway")
					),
					sql.not_(model.Stop.id.in_(
						sql.select([model.tags.c.stop_id]).where(model.tags.c.name==u"naptan:AtcoCode")
					))
				))
				if "local_ref" in stop.tags:	
					stops_query = stops_query.order_by(
						(1-sql.exists().where(sql.and_(
							model.tags.c.stop_id == model.Stop.id,
							model.tags.c.name == u"name",
							model.tags.c.value.contains(stop.tags["local_ref"].value)
						)))
						+sql.func.sqrt(
							sql.func.pow(model.Stop.lat-stop.lat, 2)
							+sql.func.pow(model.Stop.lon-stop.lon, 2)
						)
					)
				else:
					stops_query = stops_query.order_by(
						sql.func.sqrt(
							sql.func.pow(model.Stop.lat-stop.lat, 2)
							+sql.func.pow(model.Stop.lon-stop.lon, 2)
						)
					)

			elif "naptan:AtcoCode" not in stop.tags and "highway" in stop.tags:
				# Plain OSM node, select all Naptan nodes in the area:
				stops_query = stops_query.filter(sql.and_(
					sql.func.sqrt(
						sql.func.pow(model.Stop.lat-stop.lat, 2)
						+sql.func.pow(model.Stop.lon-stop.lon, 2)
					) < 0.005,
					sql.not_(model.Stop.id.in_(
						sql.select([model.tags.c.stop_id]).where(model.tags.c.name==u"highway")
					)),
					model.Stop.id.in_(
						sql.select([model.tags.c.stop_id]).where(model.tags.c.name==u"naptan:AtcoCode")
					)
				))
				if "name" in stop.tags:	
					stops_query = stops_query.order_by(
						(1-sql.exists().where(sql.and_(
							model.tags.c.stop_id == model.Stop.id,
							model.tags.c.name == u"local_ref", 
							sql.literal(stop.tags["name"].value).contains(model.tags.c.value)
						)))
						+sql.func.sqrt(
							sql.func.pow(model.Stop.lat-stop.lat, 2)
							+sql.func.pow(model.Stop.lon-stop.lon, 2)
						)
					)
				else:
					stops_query = stops_query.order_by(
						sql.func.sqrt(
							sql.func.pow(model.Stop.lat-stop.lat, 2)
							+sql.func.pow(model.Stop.lon-stop.lon, 2)
						)
					)
			else:
				# Do not return any similar stops for merged or finished stops:
				return []
			
		if "loc" in request.GET:
			loc_str = request.GET.get("loc")
			loc = [ float(l.strip()) for l in loc_str.split(",") ]
			stops_query = stops_query.filter(
				sql.func.sqrt(sql.func.pow(model.Stop.lat-loc[1], 2)
				+sql.func.pow(model.Stop.lon-loc[0], 2)
				) < 0.005
			).order_by(sql.func.sqrt(sql.func.pow(model.Stop.lat-loc[1], 2)
				+sql.func.pow(model.Stop.lon-loc[0], 2)
				)).limit(10)

		stops_struct = []
		for stop in stops_query.all():
			tags_struct = {}
			for tag in stop.tags:
				tags_struct[tag] = stop.tags[tag].value
			stops_struct.append({
				"id": stop.id,
				"lat": float(stop.lat),
				"lon": float(stop.lon),
				"osm_id": stop.osm_id,
				"osm_version": stop.osm_version,
				"tags": tags_struct
			})

		return {"stops": stops_struct, "timestamp": str(model.planet_timestamp.get())}

	@jsonify
	def show(self, id):
		stop = session.query(model.Stop).filter_by(id=id).one()
		
		stop_struct = {
			"id": stop.id,
			"lat": float(stop.lat),
			"lon": float(stop.lon),
			"osm_id": stop.osm_id,
			"osm_version": stop.osm_version,
			"tags": {}
		}
		for tag in stop.tags:
			stop_struct["tags"][tag] = stop.tags[tag].value
	
		return stop_struct
