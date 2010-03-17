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

"""The application's model objects"""
import os
from uuid import uuid4
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy import orm
from sqlalchemy.sql import expression as sql
from sqlalchemy.sql import functions as func
from sqlalchemy.orm.collections import column_mapped_collection

from novam.model import meta


def init_model(engine, planet_timestamp_file):
	"""Call me before using any of the tables or classes in the model"""

	global stops, tags

	stops = sa.Table("stops", meta.metadata, autoload=True, autoload_with=engine)
	tags = sa.Table("tags", meta.metadata, autoload=True, autoload_with=engine)
	stop_locations = sa.Table("stop_locations", meta.metadata, autoload=True, autoload_with=engine)
	stop_stats_cache = sa.Table("stop_stats_cache", meta.metadata, autoload=True, autoload_with=engine)
	nptg_regions = sa.Table("nptg_regions", meta.metadata, autoload=True, autoload_with=engine)
	nptg_areas = sa.Table("nptg_areas", meta.metadata, autoload=True, autoload_with=engine)
	nptg_districts = sa.Table("nptg_districts", meta.metadata, autoload=True, autoload_with=engine)
	nptg_localities = sa.Table("nptg_localities", meta.metadata, autoload=True, autoload_with=engine)

	locality_stats = sql.select([
		nptg_localities.c.code, 
		nptg_localities.c.name, 
		nptg_localities.c.region_code,
		nptg_localities.c.area_code,
		nptg_localities.c.district_code,
		func.sum(stop_stats_cache.c.verified_stops).label("verified_stops"), 
		func.sum(stop_stats_cache.c.unverified_stops).label("unverified_stops")
	], from_obj=stop_stats_cache.join(nptg_localities)).group_by(nptg_localities.c.code).group_by(
		nptg_localities.c.code, nptg_localities.c.name, nptg_localities.c.region_code, 
		nptg_localities.c.area_code, nptg_localities.c.district_code
	)

	district_stats = sql.select([
		nptg_districts.c.code,
		nptg_districts.c.name,
		nptg_districts.c.region_code,
		nptg_districts.c.area_code,
		func.sum(stop_stats_cache.c.verified_stops).label("verified_stops"),  
		func.sum(stop_stats_cache.c.unverified_stops).label("unverified_stops")
	], from_obj=stop_stats_cache.join(nptg_localities).join(
		nptg_districts, nptg_localities.c.district_code == nptg_districts.c.code)).group_by(
		nptg_districts.c.code, nptg_districts.c.name, nptg_districts.c.region_code, 
		nptg_districts.c.area_code
	)

	area_stats = sql.select([
		nptg_areas.c.code,
		nptg_areas.c.name,
		nptg_areas.c.region_code,
		func.sum(stop_stats_cache.c.verified_stops).label("verified_stops"),  
		func.sum(stop_stats_cache.c.unverified_stops).label("unverified_stops")
	], from_obj=stop_stats_cache.join(nptg_localities).join(nptg_areas)).group_by(
		nptg_areas.c.code, nptg_areas.c.name, nptg_areas.c.region_code
	)


	region_stats = sql.select([
		nptg_regions.c.code, 
		nptg_regions.c.name,
		nptg_regions.c.country,
		func.sum(stop_stats_cache.c.verified_stops).label("verified_stops"),  
		func.sum(stop_stats_cache.c.unverified_stops).label("unverified_stops")
	], from_obj=stop_stats_cache.join(nptg_localities).join(nptg_regions)).group_by(
		nptg_regions.c.code, nptg_regions.c.name, nptg_regions.c.country
	)

	orm.mapper(Stop, stops, properties={
		"tags": orm.relation(Tag, collection_class=column_mapped_collection(tags.c.name),
				lazy=False, passive_deletes=True)
	})
	orm.mapper(Tag, tags)
	orm.mapper(StopLocation, stop_locations)
	orm.mapper(LocalityStats, locality_stats)
	orm.mapper(DistrictStats, district_stats)
	orm.mapper(AreaStats, area_stats)
	orm.mapper(RegionStats, region_stats)

	meta.session.configure(bind=engine)
	meta.engine = engine

	meta.planet_timestamp = planet_timestamp_file
	global planet_timestamp
	planet_timestamp = _TimestampFile(meta.planet_timestamp)

stops = None

class Stop(object):
	def __init__(self, lat, lon, osm_id=None, osm_version=None):
			self.lat = lat
			self.lon = lon
			self.osm_id = osm_id
			self.osm_version = osm_version

tags = None

class Tag(object):
	def __init__(self, name, value):
		self.name = name
		self.value = value

class StopLocation(object):
	pass

class LocalityStats(object):
	pass

class DistrictStats(object):
	pass

class AreaStats(object):
	pass

class RegionStats(object):
	pass

# Access planet timestamp
class _TimestampFile:

	FORMAT = "%Y-%m-%dT%H:%M:%SZ"

	def __init__(self, file):
		self.__file = file
	
	def get(self):
		fh = open(self.__file, "rb")
		ts = datetime.strptime(fh.read(20), self.FORMAT)
		fh.close()
		return ts

	def set(self, timestamp):
		fh = open(self.__file, "wb")
		fh.write(timestamp.strftime(self.FORMAT))
		fh.close()

