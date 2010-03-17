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
 * Class: Novam.MapKey
 * Displays a dynamic map key
 */
Novam.MapKey = Class.create(Novam.Widget, {
	
	model: null,
	list: null,
	notes: null,

	initialize: function(model) {
		Novam.Widget.prototype.initialize.call(this);

		this.model = model;
		this.model.events.register("scheme_selected", this, this.scheme_selected);
		this.model.events.register("scheme_unselected", this, this.scheme_unselected);
		this.model.events.register("map_changed", this, this.update_timestamp);

		var caption = new Element("h2", {"class": "MapKey"});
		caption.appendChild(Text("Map Key"));
		
		this.list = new Element("dl", {"class": "MapKey"});

		this.notes = new Element("p", {"class": "MapKey"});

		this.container.appendChild(caption);
		this.container.appendChild(this.list);
		this.container.appendChild(this.notes);

		// Set default contents:
		this.scheme_unselected(null);
	},
	
	scheme_selected: function(scheme) {
		this.list.removeChildren();
		
		$H(scheme.map_key).each(function(item) {
			var dt = new Element('dt');
			dt.appendChild(new Element("img", {
				"src": item.key + ".png", 
				"alt": item.key + " bus stop marker"
			}));
			
			var dd = new Element('dd');
			dd.appendChild(Text(item.value));

			this.list.appendChild(dt);
			this.list.appendChild(dd);
		}, this);
	},

	scheme_unselected: function(scheme) {
		var dd = new Element("dd");
		dd.appendChild(Text("Please select a colour scheme (see below)"));

		this.list.removeChildren();
		this.list.appendChild(new Element("dt"));
		this.list.appendChild(dd);
	},

	update_timestamp: function(map) {
		this.notes.replaceChildren(Text("Bus stops last updated: " + map.timestamp));
	}
});
