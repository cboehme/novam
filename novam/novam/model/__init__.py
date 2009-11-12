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
from sqlalchemy.orm.collections import column_mapped_collection

from novam.model import meta


def init_model(engine, planet_timestamp_file):
	"""Call me before using any of the tables or classes in the model"""

	global stops, tags

	stops = sa.Table("stops", meta.metadata, autoload=True, autoload_with=engine)
	tags = sa.Table("tags", meta.metadata, autoload=True, autoload_with=engine)
	
	orm.mapper(Stop, stops, properties={
		"tags": orm.relation(Tag, collection_class=column_mapped_collection(tags.c.name), \
				lazy=False, passive_deletes=True)
	})
	orm.mapper(Tag, tags)

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

	def __repr__(self):
		return "Stop(id=%s, lat=%s, lon=%s, osm_id=%s)" % (self.id, self.lat, self.lon, self.osm_id)

tags = None

class Tag(object):
	def __init__(self, name, value):
		self.name = name
		self.value = value

	def __repr__(self):
		return "Tag(stop_id=%s, name=%s, value=%s)" % (self.stop_id, self.name, self.value)

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

