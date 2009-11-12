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

import os
from datetime import datetime
from paste.script.command import Command
from paste.deploy import appconfig
from pylons import config
import logging

from novam.config.environment import load_environment

__all__ = ['UpdatePlanetCommand']

class UpdatePlanetCommand(Command):
	# Parser configuration
	summary = "Update bus stops and naptan nodes from a osmosis changeset"
	description = """
	"""
	usage = "osmosis-changeset.osc timestamp [config-file]"
	group_name = "novam"
	parser = Command.standard_parser()
	min_args = 2
	max_args = 3

	def command(self):
		if len(self.args) == 2:
			# Assume the .ini file is ./development.ini
			config_file = "development.ini"
			if not os.path.isfile(config_file):
				raise BadCommand("%sError: CONFIG_FILE not found at: .%s%s\n"
				                 "Please specify a CONFIG_FILE" % \
				                 (self.parser.get_usage(), os.path.sep,
				                 config_file))
		else:
			config_file = self.args[2]

		config_name = "config:%s" % config_file
		here_dir = os.getcwd()

		# Configure logging from the config file
		self.logging_file_config(config_file)

		log = logging.getLogger(__name__)

		conf = appconfig(config_name, relative_to=here_dir)
		load_environment(conf.global_conf, conf.local_conf)

		import novam.lib.planet_osm as planet
		from novam.model import meta, planet_timestamp
		
		planet.load(self.args[0], datetime.strptime(self.args[1], planet_timestamp.FORMAT), planet.Updater())
		meta.session.commit()
