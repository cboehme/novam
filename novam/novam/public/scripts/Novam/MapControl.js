/*
 * (c) 2009 Christoph Böhme <christoph@b3e.net>
 * 
 * This file is part of Novam.
 * 
 * Novam is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Novam is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Class: Novam.MapControl
 */
Novam.MapControl = Class.create({

	EPSG4326: new OpenLayers.Projection("EPSG:4326"),
	EPSG900913: new OpenLayers.Projection("EPSG:900913"),

	HIGHLIGHTED: "_highlighted",
	UNHIGHLIGHTED: "",
	SELECTED: "_selected",
	UNSELECTED: "",
	MARKED: "_marked",
	UNMARKED: "",

	model: null,
	map: null,
	marker_layer: null,
	feature_control: null,
	permalink_control: null,
	map_status: null,
	get_stop_icon: null,
	marker_z_order: null,
	_default_marker_z_order: ["grey_icon"],

	initialize: function(container, model) {

		this.model = model;
		this.model.events.register("stop_added", this, this.stop_added);
		this.model.events.register("stop_removed", this, this.stop_removed);
		this.model.events.register("stop_updated", this, this.stop_updated);
		this.model.events.register("stop_selected", this, this.stop_selected);
		this.model.events.register("stop_unselected", this, this.stop_unselected);
		this.model.events.register("stop_highlighted", this, this.stop_highlighted);
		this.model.events.register("stop_unhighlighted", this, this.stop_unhighlighted);
		this.model.events.register("stop_marked", this, this.stop_marked);
		this.model.events.register("stop_unmarked", this, this.stop_unmarked);
		this.model.events.register("scheme_selected", this, this.scheme_selected);
		this.model.events.register("scheme_unselected", this, this.scheme_unselected);

		// Create map and basic controls:
		var restrictedExtent = new OpenLayers.Bounds(-11.6, 49.6, 3.6, 61.3);
		this.map = new OpenLayers.Map(container, {
			controls: [
				new OpenLayers.Control.Navigation(),
				new OpenLayers.Control.PanZoomBar(),
				new OpenLayers.Control.LayerSwitcher()
			],
			units: 'm',
			projection: this.EPSG900913,
			displayProjection: this.EPSG4326,
			restrictedExtent: restrictedExtent.transform(this.EPSG4326, this.EPSG900913)
		});

		this.permalink_control = new OpenLayers.Control.Permalink()
		this.map.addControl(this.permalink_control);
		this.permalink_control.activate();

		// Create load indicator:
		this.map_status = new Element("div", {"class": "MapStatus"});
		$(container).appendChild(this.map_status);
		this.map_status.hide();
		
		// Create a mapnik base layer:
		var mapnik = new OpenLayers.Layer.OSM.Mapnik("OpenStreetMap (Mapnik)", {
			displayOutsideMaxExtent: true,
			transitionEffect: "resize"
		});
		this.map.addLayer(mapnik);
	
		// Create a öpnvkarte base layer:
		/* I need to ask if they mind if we use their tiles
		 * 
		var public_transport = new OpenLayers.Layer.OSM(
			"Public Transport Map (from &ouml;pnvkarte.de)", 
			"http://tile.xn--pnvkarte-m4a.de/tilegen/", {
			numZoomLevels: 19,
			buffer: 0,
			displayOutsideMaxExtent: true,
			transitionEffect: "resize"
		});
		this.map.addLayer(public_transport);
		*/

		// Set default marker scheme:
		this.get_stop_icon = this._default_get_stop_icon;
		this.marker_z_order = this._default_marker_z_order;

		// Create the marker layer:
		this.marker_layer = new OpenLayers.Layer.Vector("Bus Stops", {
			transitionEffect: "resize",
			displayInLayerSwitcher: false,
			rendererOptions: {zIndexing: true}
		});
		this.map.addLayer(this.marker_layer);

		this._set_marker_style();

		this.map.events.register("moveend", this, this.update_cookie);
		this.map.events.register("moveend", this, this.update_model);
		this.map.events.register("changelayer", this, this.update_cookie);

		// Add control for the marker layer:
		this.feature_control = new Novam.FeatureControl(this.marker_layer);
		this.map.addControl(this.feature_control);
		this.feature_control.activate();

		// Register event handlers for features:
		this.feature_control.events.register("click", this, function (evt) {
			this.model.select_stop(evt.feature.attributes.id);
		});

		this.feature_control.events.register("clickout", this, function (evt) {
			this.model.unselect_stop();
		});

		this.feature_control.events.register("mouseover", this, function (evt) {
			this.model.highlight_stop(evt.feature.attributes.id);
		});

		this.feature_control.events.register("mouseout", this, function (evt) {
			this.model.unhighlight_stop();
		});
		
		// Load previous map location:
		var loc = new OpenLayers.LonLat(-2.9, 54.7);
		var zoom = 5;
		var layers = "BT";
		cookie = getCookie("map_state");
		if (cookie != null) {
			v = cookie.split(":");
			if (v.length == 4) {
				loc.lat = Number(v[0]);
				loc.lon = Number(v[1]);
				zoom = Number(v[2]);
				layers = v[3];
			}
		}
		if (!this.map.getCenter()) {
			this.map.setCenter(loc.transform(
				this.EPSG4326, this.map.getProjectionObject()), zoom);
			this._set_layer_visibility(layers);
		} else {
			// ArgParser centres the map before our event handlers
			// are installed. So, we call the methods manually now:
			this.update_cookie();
			this.update_model();
		}
	},

	destroy: function() {
		this.map = null;
		this.marker_layer = null;
		this.feature_control = null;
		this.map_status = null;
		this.model = null;
	},

	update_cookie: function() {
		var loc = this.map.getCenter().clone().transform(
			this.map.getProjectionObject(), this.EPSG4326);
		var zoom = this.map.getZoom();
		var layers = this._get_layer_visibility();

		var decimals = Math.pow(10, Math.floor(zoom/3));

		loc.lat = Math.round(loc.lat * decimals) / decimals;
		loc.lon = Math.round(loc.lon * decimals) / decimals;

		setCookie("map_state", [ loc.lat, loc.lon, zoom, layers].join(":"));
	},

	update_model: function() {
		var bounds = this.map.getExtent().clone();
		bounds = bounds.transform(this.map.getProjectionObject(), this.EPSG4326);

		this.model.update_map(bounds, this.map.getZoom());

		if (this.map.getZoom() > 14)
		{
			this.map_status.replaceChildren(Text("Loading ..."));
			this.map_status.show();

			var request = OpenLayers.Request.GET({
				url: "osmdata?bbox="+bounds.toBBOX(),
				scope: this,
				success: function (request)
				{
					json = new OpenLayers.Format.JSON();
					data = json.read(request.responseText);
					data.stops.each(function (stop) {
						this.model.add_stop(stop);
					}, this);
					this.map_status.hide();
				}
			});
			
			// Remove stops which are outside the viewport:
			var remove_features = Array();
			this.marker_layer.features.each(function(stop) {
				if (!this.map.getExtent().containsLonLat(
					new OpenLayers.LonLat(stop.geometry.x, stop.geometry.y))
					&& !this.model.is_stop_selected(stop.attributes.id)
					&& !this.model.is_stop_highlighted(stop.attributes.id)
					&& !this.model.is_stop_marked(stop.attributes.id)) {
					remove_features.push(stop.attributes.id);
				}
			}, this);
			remove_features.each(this.model.remove_stop, this.model);
		} else {
			this.model.clear_stops();

			this.map_status.replaceChildren(Text("Please zoom in to see the bus stops overlay"));
			this.map_status.show();
		}
	},
	
	stop_added: function(stop) {

		var position = new OpenLayers.Geometry.Point(stop.lon, stop.lat);
		position = position.transform(this.EPSG4326, this.EPSG900913);

		var attributes = {
			id: stop.id,
			icon: this.get_stop_icon(stop),
			highlighted: this.UNHIGHLIGHTED,
			selected: this.UNSELECTED,
			marked: this.UNMARKED
		};

		this.marker_layer.addFeatures([new OpenLayers.Feature.Vector(position, attributes)]);
	},

	stop_removed: function(stop) {
		this.marker_layer.destroyFeatures([this._find_stop(stop.id)]);
	},

	stop_updated: function(stop) {
		var feature = this._find_stop(stop.id);
		feature.attributes.icon = this.get_stop_icon(stop);
		this.marker_layer.drawFeature(feature);
	},
	
	stop_highlighted: function(stop) {
		var feature = this._find_stop(stop.id);
		feature.attributes.highlighted = this.HIGHLIGHTED;
		this.marker_layer.drawFeature(feature);
	},

	stop_unhighlighted: function(stop) {
		var feature = this._find_stop(stop.id);
		feature.attributes.highlighted = this.UNHIGHLIGHTED;
		this.marker_layer.drawFeature(feature);
	},

	stop_selected: function(stop) {
		var feature = this._find_stop(stop.id);
		feature.attributes.selected = this.SELECTED;
		this.marker_layer.drawFeature(feature);
	},

	stop_unselected: function(stop) {
		var feature = this._find_stop(stop.id);
		feature.attributes.selected = this.UNSELECTED;
		this.marker_layer.drawFeature(feature);
	},

	stop_marked: function(stop) {
		var feature = this._find_stop(stop.id);
		feature.attributes.marked = this.MARKED;
		this.marker_layer.drawFeature(feature);
	},

	stop_unmarked: function(stop) {
		var feature = this._find_stop(stop.id);
		feature.attributes.marked = this.UNMARKED;
		this.marker_layer.drawFeature(feature);
	},

	scheme_selected: function(scheme) {
		this.get_stop_icon = scheme.get_stop_icon;
		this.marker_z_order = scheme.z_order;
		this._set_marker_style();
		this._update_stop_markers();
		this._update_permalink(scheme.id);
	},

	scheme_unselected: function(scheme) {
		this.get_stop_icon = this._default_get_stop_icon;
		this.marker_z_order = this._default_marker_z_order;
		this._set_marker_style();
		this._update_stop_markers();
		this._update_permalink(null);
	},

	_find_stop: function(id) {
		return this.marker_layer.features.find(function(feature) { 
			return feature.attributes.id == id; 
		});
	},
	
	_set_marker_style: function() {
		var styleMap = new OpenLayers.StyleMap({
			"default": new OpenLayers.Style({
				graphicHeight: 16,
				graphicWidth: 16,
				graphicXOffset: -8,
				graphicYOffset: -8,
				externalGraphic: "${icon}${selected}${highlighted}.png",
				cursor: "pointer"
			})
		});

		var iconLookup = {};
		for (var i = 0; i < this.marker_z_order.length; ++i) {
			iconLookup[this.marker_z_order[i]] = { graphicZIndex: i + 1 };
		};
		styleMap.addUniqueValueRules("default", "icon", iconLookup);
		
		var highlightedLookup = {
			"_highlighted": {
				graphicHeight: 22,
				graphicWidth: 22,
				graphicXOffset: -11,
				graphicYOffset: -11,
				graphicZIndex: this.marker_z_order.length + 2
			},
			"": {}
		};
		styleMap.addUniqueValueRules("default", "highlighted", highlightedLookup);

		var selectedLookup = {
			"_selected": {
				cursor: "",
				graphicZIndex: this.marker_z_order.length + 1
			},
			"": {}
		};
		styleMap.addUniqueValueRules("default", "selected", selectedLookup);

		this.marker_layer.styleMap = styleMap;
	},

	_update_stop_markers: function() {
		this.marker_layer.features.each(function(stop) {
			 stop.attributes.icon = this.get_stop_icon(this.model.stops.get(stop.attributes.id));
			 this.marker_layer.drawFeature(stop);
		}, this);
	},

	_update_permalink: function(scheme_id) {
		var href = location.href;
		if (href.indexOf("?") != -1) {
			ref = href.substring(0, href.indexOf("?"));
		}

		var params = OpenLayers.Util.getParameters(href);
		params.scheme = scheme_id;
		href += '?' + OpenLayers.Util.getParameterString(params);

		this.permalink_control.base = href;
		this.permalink_control.updateLink();
	},

	_get_layer_visibility: function() {
		layers = "";
		for(var i = 0; i < this.map.layers.length; ++i) {
			var layer = this.map.layers[i];

			if (layer.isBaseLayer) {
				layers += (layer == this.map.baseLayer) ? "B" : "0";
			} else {
				layers += (layer.getVisibility()) ? "T" : "F";
			}
		}
		return layers;
	},

	_set_layer_visibility: function(layers) {
		if (layers.length == this.map.layers.length) {
			for(var i = 0; i < layers.length; ++i) {

				var layer = this.map.layers[i];
				var c = layers.charAt(i);

				if (c == "B") {
					this.map.setBaseLayer(layer);
				} else if ((c == "T") || (c == "F")) {
					layer.setVisibility(c == "T");
				}
			}
		}
	},

	_default_get_stop_icon: function(stop) {
		return "grey_stop";
	}
});
