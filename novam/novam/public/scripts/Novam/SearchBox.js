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
 * Class: Novam.SearchBox
 * A widget offering a search box to search the map
 */
Novam.SearchBox = Class.create(Novam.Widget, {

	EPSG4326: new OpenLayers.Projection("EPSG:4326"),
	map: null,
	textBox: null,
	locationInfo: null,
	locations: null,
	currentLocation: -1,

	initialize: function(map) {
		Novam.Widget.prototype.initialize.call(this);

		this.map = map;

		this.textBox = Builder.node("input", {"type": "text", "id": "searchBox" + this.widgetId});
		this.textBox.observe("keypress", function(evt) {
			var key = event.which || event.keyCode;
			if (key == Event.KEY_RETURN) {
				this.searchLocation();
			}
		}.bind(this));
		
		var label = Builder.node("label", {"for": this.textBox.id}, "Go to");

		var searchButton = Builder.node("button", {"type": "button"}, "Search");
		searchButton.observe("click", function(evt) {
			this.searchLocation();
		}.bind(this));

		var previousButton = Builder.node("button", {"type": "button"}, "<");
		previousButton.observe("click", function(evt) {
			if (this.currentLocation > 0) {
				this.gotoLocation(this.currentLocation-1);
			} else {
				this.gotoLocation(this.locations.length-1);
			}
		}.bind(this));

		var nextButton = Builder.node("button", {"type": "button"}, ">");
		nextButton.observe("click", function(evt) {
			if (this.currentLocation+1 < this.locations.length) {
				this.gotoLocation(this.currentLocation+1);
			} else {
				this.gotoLocation(0);
			}
		}.bind(this));

		this.locationInfo = Builder.node("span", {"class": "SearchBox LocationInfo"});

		var fieldset = Builder.node("fieldset", {"class": "SearchBox"},
			[label, this.textBox, searchButton, previousButton, this.locationInfo, nextButton]);

		this.container.appendChild(fieldset);
	},

	searchLocation: function() {
		var bounds = this.map.getExtent().clone();
		bounds = bounds.transform(this.map.getProjectionObject(), this.EPSG4326).toArray();
		var viewbox = bounds[0]+","+bounds[3]+","+bounds[2]+","+bounds[1];
		
		var request = OpenLayers.Request.GET({
			url: "nominatim?viewbox="+viewbox+"&q="+encodeURIComponent(this.textBox.value)+"&format=xml",
			scope: this,
			success: function (request)
			{
				var data = request.responseXML.getElementsByTagName("place");
				this.locations = [];
				for(var i=0; i < data.length; ++i) {
					var loc = new OpenLayers.LonLat(data[i].getAttribute("lon"), data[i].getAttribute("lat"));
					loc = loc.transform(this.EPSG4326, this.map.getProjectionObject());

					if (this.map.getMaxExtent({restricted: true}).containsLonLat(loc)) {
						var locInfo = data[i].getAttribute("display_name");
						locInfo = locInfo.replace(/, Europe$/, "").replace(/, United Kingdom$/, "");
						var bounds = data[i].getAttribute("boundingbox").split(",");
						bounds = new OpenLayers.Bounds(bounds[2], bounds[0], bounds[3], bounds[1]);
						this.locations.push({info: locInfo, boundingBox: bounds});	
					}
				}
				this.gotoLocation(0);
			}
		});
	},

	gotoLocation: function(loc) {
		this.locationInfo.replaceChildren(Text(this.locations[loc].info));
		var extent = this.locations[loc].boundingBox.clone();
		this.map.zoomToExtent(extent.transform(this.EPSG4326, this.map.getProjectionObject()));
		this.currentLocation = loc;
	}
});
