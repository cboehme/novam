CREATE SEQUENCE stops_id_seq;

CREATE TABLE stops (
	id INTEGER DEFAULT nextval('stops_id_seq') NOT NULL PRIMARY KEY,
	lat DECIMAL(10,7) NOT NULL,
	lon DECIMAL(10,7) NOT NULL,
	osm_id BIGINT NOT NULL UNIQUE,
	osm_version BIGINT NOT NULL CHECK (osm_version > 0)
	);
ALTER SEQUENCE stops_id_seq OWNED BY stops.id;

CREATE INDEX stops_lat_lon_idx ON stops (lat, lon);
CREATE INDEX stops_lon_lat_idx ON stops (lon, lat);
CREATE INDEX stops_osm_id_osm_version_idx ON stops (osm_id, osm_version);

CREATE TABLE Tags (
	stop_id INTEGER NOT NULL
		REFERENCES stops(id) ON DELETE CASCADE,
	name VARCHAR(255) NOT NULL,
	value VARCHAR(65535) NOT NULL,  -- based on MySQL's TEXT type
	PRIMARY KEY (stop_id, name)
	);

VACUUM ANALYZE;
