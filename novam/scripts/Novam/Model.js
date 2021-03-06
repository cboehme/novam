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

Novam.Model = Class.create({

	EVENT_TYPES: ["stop_added", "stop_removed", "stop_updated",
		"stop_selected", "stop_unselected", "stop_highlighted", 
		"stop_unhighlighted", "stop_marked", "stop_unmarked",
		"scheme_added", "scheme_selected", "scheme_unselected", 
		"map_changed"],

	events: null,
	stops: null,
	selected_stop: null,
	highlighted_stop: null,
	marked_stop: null,
	schemes: null,
	selected_scheme: null,
	map: null,

	initialize: function() {
		this.events = new OpenLayers.Events(this, null, this.EVENT_TYPES);

		this.stops = new Hash();
		this.selected_stop = null;
		this.highlighted_stop = null;
		this.marked_stop = null;
		
		this.schemes = new Hash();
		this.selected_scheme = null;

		this.map = null;
	},

	destroy: function() {
		this.clear_stops();
		this.marked_stop = null;
		this.hightlighted_stop = null;
		this.selected_stop = null;
		this.stops = null;

		this.unselect_scheme();
		this.selected_scheme = null;
		this.schemes = null;
		this.map = null;

		this.zoom = null;

		this.events = null;
	},

	has_stop: function(id) {
		return this.stops.get(id) !== undefined;
	},

	add_stop: function(stop) {
		if (!this.has_stop(stop.id)) {
			this.stops.set(stop.id, stop);
			this.events.triggerEvent("stop_added", stop);
		} else {
			this.stops.set(stop.id, stop);
			if (this.is_stop_selected(stop.id)) {
				this.selected_stop = stop;
			}
			if (this.is_stop_highlighted(stop.id)) {
				this.highlighted_stop = stop;
			}
			if (this.is_stop_marked(stop.id)) {
				this.marked_stop = stop;
			}
			this.events.triggerEvent("stop_updated", stop);
		}
	},

	remove_stop: function(id) {
		var stop = this.stops.unset(id);
		if (stop !== undefined) {
			if (this.is_stop_selected(id)) {
				this.unselect_stop();
			}
			if (this.is_stop_highlighted(id)) {
				this.unhighlight_stop();
			}
			if (this.is_stop_marked(id)) {
				this.unmark_stop();
			}
			this.events.triggerEvent("stop_removed", stop);
		}
	},

	update_stop: function(stop) {
		if(this.has_stop(stop.id)) {
			this.stops.set(stop.id, stop);
			if (this.is_stop_selected(stop.id)) {
				this.selected_stop = stop;
			}
			if (this.is_stop_highlighted(stop.id)) {
				this.highlighted_stop = stop;
			}
			if (this.is_stop_marked(stop.id)) {
				this.marked_stop = stop;
			}
			this.events.triggerEvent("stop_updated", stop);
		} else {
			this.stops.set(stops.id, stop);
			this.events.triggerEvent("stop_added", stop);
		}
	},

	clear_stops: function() {
		this.stops.each(function(stop) {
			this.remove_stop(stop[0]);
		}, this);
	},

	is_stop_selected: function(id) {
		return this.selected_stop !== null 
			&& this.selected_stop.id == id;
	},

	select_stop: function(id) {
		if (!this.is_stop_selected(id)) {
			this.unselect_stop();
			var stop = this.stops.get(id);
			if (stop !== undefined) {
				this.selected_stop = stop;
				this.events.triggerEvent("stop_selected", stop);
			}
		}
	},

	unselect_stop: function() {
		if (this.selected_stop !== null) {
			var stop = this.selected_stop;
			this.selected_stop = null;
			this.events.triggerEvent("stop_unselected", stop);
		}
	},

	is_stop_highlighted: function(id) {
		return this.highlighted_stop !== null 
			&& this.highlighted_stop.id == id;
	},

	highlight_stop: function(id) {
		if (!this.is_stop_highlighted(id)) {
			this.unhighlight_stop();
			var stop = this.stops.get(id);
			if (stop !== undefined) {
				this.highlighted_stop = stop;
				this.events.triggerEvent("stop_highlighted", stop);
			}
		}
	},

	unhighlight_stop: function() {
		if (this.highlighted_stop !== null) {
			var stop = this.highlighted_stop;
			this.highlighted_stop = null;
			this.events.triggerEvent("stop_unhighlighted", stop);
		}
	},

	is_stop_marked: function(id) {
		return this.marked_stop !== null 
			&& this.marked_stop.id == id;
	},

	mark_stop: function (id) {
		if (!this.is_stop_marked(id)) {
			this.unmark_stop();
			var stop = this.stops.get(id);
			if (stop !== undefined) {
				this.marked_stop = stop;
				this.events.triggerEvent("stop_marked", stop);
			}
		}
	},

	unmark_stop: function() {
		if (this.marked_stop !== null) {
			var stop = this.marked_stop;
			this.marked_stop = null;
			this.events.triggerEvent("stop_unmarked", stop);
		}
	},

	has_scheme: function(id) {
		return this.schemes.get(id) !== undefined;
	},

	add_scheme: function(scheme) {
		if (!this.has_scheme(scheme.id)) {
			this.schemes.set(scheme.id, scheme);
			this.events.triggerEvent("scheme_added", scheme);
		}
	},

	is_scheme_selected: function(id) {
		return this.selected_scheme !== null 
			&& this.selected_scheme.id == id;
	},

	select_scheme: function(id) {
		if (!this.is_scheme_selected(id)) {
			this.unselect_scheme();
			var scheme = this.schemes.get(id);
			if (scheme !== undefined) {
				this.selected_scheme = scheme;
				this.events.triggerEvent("scheme_selected", scheme);
			}
		}
	},

	unselect_scheme: function() {
		if (this.selected_scheme !== null) {
			var scheme = this.selected_scheme;
			this.selected_scheme = null;
			this.events.triggerEvent("scheme_unselected", scheme);
		}
	},

	update_map: function(bounds, zoom, timestamp) {
		if (arguments.length < 3) {
			if (this.map !== null) {
				timestamp = this.map.timestamp;
			} else {
				timestamp = null;
			}
		}

		this.map = {
			"bounds": bounds,
			"zoom": zoom,
			"timestamp": timestamp
		};
		this.events.triggerEvent("map_changed", this.map);
	}
});
