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
	map_status: null,
	get_stop_icon: null,

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

		var restrictedExtent = new OpenLayers.Bounds(-11.6, 49.6, 3.6, 61.3);
		this.map = new OpenLayers.Map(container, {
			controls: [
				new OpenLayers.Control.Navigation(),
				new OpenLayers.Control.PanZoomBar(),
				new OpenLayers.Control.LayerSwitcher(),
				new OpenLayers.Control.Permalink()
			],
			units: 'm',
			projection: this.EPSG900913,
			displayProjection: this.EPSG4326,
			restrictedExtent: restrictedExtent.transform(this.EPSG4326, this.EPSG900913)
		});

		// Create load indicator:
		this.map_status = new Element("div", {"class": "MapStatus"});
		$(container).appendChild(this.map_status);
		this.map_status.hide();
		
		// Create a mapnik base layer:
		var mapnik = new OpenLayers.Layer.OSM.Mapnik("OpenStreetMap", {
			displayOutsideMaxExtent: true,
			transitionEffect: "resize"
		});
		this.map.addLayer(mapnik);
		
		// Install default icon handler:
		this.get_stop_icon = this._default_get_stop_icon;

		// Define styling for the marker layer:
		var styleMap = new OpenLayers.StyleMap({
			"default": new OpenLayers.Style({
				graphicHeight: 16,
				graphicWidth: 16,
				graphicXOffset: -8,
				graphicYOffset: -8,
				externalGraphic: "${icon}${selected}${marked}${highlighted}.png",
				cursor: "pointer"
			})
		});
		
		var highlightedLookup = {
			"_highlighted": {
				graphicHeight: 22,
				graphicWidth: 22,
				graphicXOffset: -11,
				graphicYOffset: -11
			},
			"": {}
		};
		styleMap.addUniqueValueRules("default", "highlighted", highlightedLookup);

		var selectedLookup = {
			"_selected": {
				cursor: ""
			},
			"": {}
		};
		styleMap.addUniqueValueRules("default", "selected", selectedLookup);

		// Create the marker layer:
		this.marker_layer = new OpenLayers.Layer.Vector('Markers', {
			styleMap: styleMap,
			transitionEffect: "resize"
		});
		this.map.addLayer(this.marker_layer);

		this.map.events.register('moveend', this, this.save_map_location);
		this.map.events.register('moveend', this, this.get_stops);
		this.map.events.register('moveend', this, 
			function(evt) { this.model.set_zoom(this.map.getZoom()); });

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
		cookie = getCookie("map_location");
		if (cookie != null) {
			v = cookie.split(":");
			loc.lat = Number(v[0]);
			loc.lon = Number(v[1]);
			zoom = Number(v[2]);
		}
		// Only set the location if no position provided in 
		// the url (which is handled by the ArgParser control:
		if (location.search == "") {
			this.map.setCenter(loc.transform(
				this.EPSG4326, this.map.getProjectionObject()), zoom);
		} else {
			this.map.events.triggerEvent("moveend");
		}
	},

	destroy: function() {
		this.map = null;
		this.marker_layer = null;
		this.feature_control = null;
		this.map_status = null;
		this.model = null;
	},

	save_map_location: function() {
		var loc = this.map.getCenter().clone().transform(
			this.map.getProjectionObject(), this.EPSG4326);
		var zoom = this.map.getZoom();

		var decimals = Math.pow(10, Math.floor(zoom/3));

		loc.lat = Math.round(loc.lat * decimals) / decimals;
		loc.lon = Math.round(loc.lon * decimals) / decimals;

		setCookie("map_location", loc.lat+":"+loc.lon+":"+zoom);
	},

	get_stops: function() {
		if (this.map.getZoom() > 14)
		{
			var bounds = this.map.getExtent().clone();
			bounds = bounds.transform(this.EPSG900913, this.EPSG4326);

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
		this._update_stop_icons();
	},

	scheme_unselected: function(scheme) {
		this.get_stop_icon = this._default_get_stop_icon;
		this._update_stop_icons();
	},

	_find_stop: function(id) {
		return this.marker_layer.features.find(function(feature) { 
			return feature.attributes.id == id; 
		});
	},

	_update_stop_icons: function() {
		this.marker_layer.features.each(function(stop) {
			 stop.attributes.icon = this.get_stop_icon(this.model.stops.get(stop.attributes.id));
			 this.marker_layer.drawFeature(stop);
		}, this);
	},

	_default_get_stop_icon: function(stop) {
		return "grey_stop";
	}
});
