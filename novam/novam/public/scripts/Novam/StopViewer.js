/**
 * Class: Novam.StopViewer
 * A widget to show a bus stop and allow merging it.
 */
Novam.StopViewer = Class.create(Novam.Widget, {
	
	model: null,
	list: null,
	extras: null,
	josm_starter: null,
	potlatch_window: null,
	flash_message: null,
	get_missing_tags: null,
	get_invalid_tags: null,

	initialize: function(model) {
		Novam.Widget.prototype.initialize.call(this);

		this.model = model;
		this.model.events.register("stop_highlighted", this, this.stop_highlighted);
		this.model.events.register("stop_unhighlighted", this, this.stop_unhighlighted);
		this.model.events.register("stop_selected", this, this.stop_selected);
		this.model.events.register("stop_unselected", this, this.stop_unselected);
		this.model.events.register("stop_updated", this, this.stop_updated);
		this.model.events.register("scheme_selected", this, this.scheme_selected);
		this.model.events.register("scheme_unselected", this, this.scheme_unselected);

		var caption = new Element("h2", {"class": "StopViewer"});
		caption.appendChild(Text("Bus Stop"));

		this.list = new Element("dl", {"class": "StopViewer"});

		this.extras = new Element("p", {"class": "StopViewer"});

		this.container.appendChild(caption);
		this.container.appendChild(this.list);
		this.container.appendChild(this.extras);

		this.get_missing_tags = this._default_get_missing_tags;
		this.get_invalid_tags = this._default_get_invalid_tags;

		this.set_stop(null);
	},

	set_stop: function(stop) {

		function appendItem(key, value, _class) {
			var attrs = {};
			if (_class != "") {
				attrs = {"class": _class};
			}
			this.list.appendChild(Fragment(
				Elem("dt", attrs, key),
				Elem("dd", attrs, value)
			));
		}
		
		this.list.removeChildren();
		if (stop === null) {
			appendItem.call(this, Text("No Stop Selected"), "", "");
		} else {
			var missing_tags = this.get_missing_tags(stop); 
			var invalid_tags = this.get_invalid_tags(stop);

			var tags = $H(missing_tags).keys();
			tags = tags.concat($H(stop.tags).keys());
			tags.sort();

			tags.each(function(tag) {
				var shortened_tag = Text(tag);
				if (tag.substring(0,7) == "naptan:") {
					shortened_tag = Fragment(
						Elem("span", {"class": "TagPrefix"}, "n:"),
						tag.substring(7)
					);
				} 

				if(tag in stop.tags) {
					if (tag in invalid_tags) {
						appendItem.call(this, shortened_tag.cloneNode(true), stop.tags[tag], "InvalidTag");
						appendItem.call(this, shortened_tag, invalid_tags[tag], "InvalidTagRemark");
					} else {
						appendItem.call(this, shortened_tag, stop.tags[tag], "");
					}
				} else {
					appendItem.call(this, shortened_tag, missing_tags[tag], "MissingTag");
				}
			}, this);
		}

		this.extras.removeChildren();
		if(this.model.selected_stop !== null && (this.model.highlighted_stop === null 
			|| this.model.selected_stop == this.model.highlighted_stop)) {

				var potlatch_link = Elem("a", { "href": "javascript:void" }, "Edit in Potlatch");
				potlatch_link.observe("click", this.edit_in_potlatch.bind(this));

				var josm_link = Elem("a", { "href": "javascript:void" }, "Edit in JOSM");
				josm_link.observe("click", this.edit_in_josm.bind(this));

				this.extras.appendChild(Fragment(potlatch_link," | ", josm_link));
		}
	},

	stop_highlighted: function(stop) {
		this.set_stop(stop);
	},

	stop_unhighlighted: function(stop) {
		this.set_stop(this.model.selected_stop);
	},

	stop_selected: function(stop) {
		this.set_stop(stop);
	},

	stop_unselected: function(stop) {
		this.set_stop(this.model.highlighted_stop);
	},

	stop_updated: function(stop) {
		if ((this.model.selected_stop !== null 
			&& this.model.selected_stop.id == stop.id)
			|| (this.model.highlighted_stop !== null
			&& this.model.highlighted_stop.id == stop.id))
		{
			this.set_stop(stop);
		}
	},

	scheme_selected: function(scheme) {
		this.get_missing_tags = scheme.get_missing_tags;
		this.get_invalid_tags = scheme.get_invalid_tags;

		// Update display:
		if (!this.model.highlighted_stop) {
			this.set_stop(this.model.selected_stop);
		} else {
			this.set_stop(this.model.highlighted_stop);
		}
	},
	
	scheme_unselected: function(scheme) {
		this.get_missing_tags = this._default_get_missing_tags;
		this.get_invalid_tags = this._default_get_invalid_tags;

		// Update display:
		if (!this.model.highlighted_stop) {
			this.set_stop(this.model.selected_stop);
		} else {
			this.set_stop(this.model.highlighted_stop);
		}
	},

	edit_in_potlatch: function() {
		var bounds = this.model.map.bounds.toArray();
		var url = "http://www.openstreetmap.org/edit?lat=" + 
			encodeURIComponent(this.model.selected_stop.lat) + "&lon=" + 
			encodeURIComponent(this.model.selected_stop.lon) + "&zoom=" +
			encodeURIComponent(this.model.map.zoom) + "&node=" + 
			encodeURIComponent(this.model.selected_stop.osm_id);
		
		if (!this.potlatch_window || this.potlatch_window.closed) {
			this.potlatch_window = window.open(url, "potlatch_window");
		} else {
			if (confirm("Potlatch is already running. If you click OK all unsaved edits will be lost.")) {
				this.potlatch_window = window.open(url, "potlatch_window");
			}
		}
	},

	edit_in_josm: function() {
		// Show message to inform user that someting is going on.
		// It would be nice to link this message with something like
		// object.onload instead of just timing it.
		if (this.flash_message == null) {
			this.flash_message = Builder.node("div", {"class": "StopViewer FlashMessage"}, 
				"Loading bus stop in JOSM ...");
			this.container.appendChild(this.flash_message);
		}
		this.flash_message.show();
		this.flash_message.fade({delay: 1.5, duration: 0.3});

		// Open JOSM remote control link in an object. This way no
		// empty browser windows will be opened:
		var bounds = this.model.map.bounds.toArray();
		var url = "http://localhost:8111/load_and_zoom?left=" +
			encodeURIComponent(bounds[0]) + "&bottom=" + 
			encodeURIComponent(bounds[1]) + "&right=" +
			encodeURIComponent(bounds[2]) + "&top=" +
			encodeURIComponent(bounds[3]) + "&select=node" +
			encodeURIComponent(this.model.selected_stop.osm_id);

		if (this.josm_starter == null) {
			this.josm_starter = Builder.node("object", {
				"data": url,
				"type": "text/plain", 
				"class": "StopViewer"
			});
			this.container.appendChild(this.josm_starter);	
		} else {
			this.josm_starter.data = url;
		}
	},
	
	_default_get_missing_tags: function(stop) {
		return {};
	},

	_default_get_invalid_tags: function(stop) {
		return {};
	}
});
