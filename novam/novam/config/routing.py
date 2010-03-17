"""Routes configuration

The more specific and detailed routes should be defined first so they
may take precedent over the more generic routes. For more information
refer to the routes manual at http://routes.groovie.org/docs/
"""
from pylons import config
from routes import Mapper

def make_map():
	"""Create, configure and return the routes Mapper"""
	map = Mapper(directory=config['pylons.paths']['controllers'],
				 always_scan=config['debug'])
	map.minimization = False

	# The ErrorController route (handles 404/500 error pages); it should
	# likely stay at the top, ensuring it can always be resolved
	map.connect('/error/{action}', controller='error')
	map.connect('/error/{action}/{id}', controller='error')

	map.connect('stats', '/stats', 
		controller='stats', action='index')
	map.connect('formatted_stats', '/stats.{format}', 
		controller='stats', action='index')
	map.connect('region_stats', '/stats/{region_code:[^/.]+}', 
		controller='stats', action='region_stats')
	map.connect('formatted_region_stats', '/stats/{region_code:[^/.]+}.{format}', 
		controller='stats', action='region_stats')
	map.connect('area_stats', '/stats/{region_code}/{area_code:[^/.]+}', 
		controller='stats', action='area_stats')
	map.connect('formatted_area_stats', 
		'/stats/{region_code}/{area_code:[^/.]+}.{format}', 
		controller='stats', action='area_stats')
	map.connect('district_stats', 
		'/stats/{region_code}/{area_code}/{district_code:[^/.]+}',
		controller='stats', action='district_stats')
	map.connect('formatted_district_stats', 
		'/stats/{region_code}/{area_code}/{district_code:[^/.]+}.{format}',
		controller='stats', action='district_stats')
	map.connect('locality_stats', 
		'/stats/{region_code}/{area_code}/{district_code}/{locality_code:[^/.]+}', 
		controller='stats', action='locality_stats')
	map.connect('formatted_locality_stats', 
		'/stats/{region_code}/{area_code}/{district_code}/{locality_code:[^/.]+}.{format}', 
		controller='stats', action='locality_stats')

	# Default routes:
	map.connect('/{controller}', action='index')
	map.connect('/{controller}/{action}')
	map.connect('/{controller}/{action}/{id}')

	return map
