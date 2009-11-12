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

"""Utilities for geometry handling
"""

def point_in_polygon(x, y, polygon):
	"""Test if (x,y) is within polygon
	"""

	n = len(polygon)
	inside = False

	p1x, p1y = polygon[0]
	for i in range(1, n+1):
		p2x, p2y = polygon[i % n]
		if y > min(p1y, p2y) and y <= max(p1y, p2y):
			if x <= max(p1x, p2x):
				if p1y != p2y:
					inter_x = float(p2x - p1x) / (p2y - p1y) * (y - p1y) + p1x
  					if x <= inter_x:
						inside = not inside
		p1x, p1y = p2x, p2y

	return inside
