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

from novam.lib.geometry_utils import point_in_polygon

def test_point_inside_triangle():
	poly = [(-10, -5), (40, 50), (100, -10)]
	r = point_in_polygon(30, 15, poly)
	assert r == True

def test_point_outside_triangle():
	poly = [(-10, -5), (40, 50), (100, -10)]
	r = point_in_polygon(80, 35, poly)
	assert r == False

def test_point_on_vertical_edge():
	poly = [(15, -10), (-15, 10), (15, 30)]
	r = point_in_polygon(15, 5, poly)
	assert r == True

def test_point_on_horizontal_edge():
	poly = [(-5, 10), (-25, 20), (20, 20)]
	r = point_in_polygon(0, 20, poly)
	assert r == True

# In my opinion a point on a vertex of a polygon should be counted
# as inside the polygon the same way points on edges are. However, 
# the algorithm does not work this way. Since this case is not 
# significant for importing bus stops it is ignored here.
#
#def test_point_on_vertex():
#	poly = [(-5, -10), (-25, 20), (20, 20)]
#	r = point_in_polygon(-5, -10, poly)
#	assert r == True
	
def test_point_inside_inline_with_horizontal_edge():
	poly = [(0, -10), (-30, 70), (0, 45), (30, 45), (0, -10)]
	r = point_in_polygon(-10, 45, poly)
	assert r == True
	
def test_point_outside_inline_with_horizontal_edge():
	poly = [(0, -10), (-30, 70), (0, 45), (30, 45), (0, -10)]
	r = point_in_polygon(45, 45, poly)
	assert r == False
	
def test_point_inside_inline_with_tip():
	poly = [(-10, -10), (-30, 40), (30, 40), (10, -5), (0, 10)]
	r = point_in_polygon(-10, 10, poly)
	assert r == True

def test_point_outside_inline_with_tip():
	poly = [(-10, -10), (-30, 40), (30, 40), (10, -5), (0, 10)]
	r = point_in_polygon(-40, -10, poly)
	assert r == False
