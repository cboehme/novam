/**
 * Class: Novam.MapKey
 * Displays a dynamic map key
 */
Novam.MapKey = Class.create(Novam.Widget, {
	
	model: null,
	list: null,

	initialize: function(model) {
		Novam.Widget.prototype.initialize.call(this);

		this.model = model;
		this.model.events.register("scheme_selected", this, this.scheme_selected);
		this.model.events.register("scheme_unselected", this, this.scheme_unselected);

		var caption = new Element("h2", {"class": "MapKey"});
		caption.appendChild(Text("Map Key"));
		
		this.list = new Element("dl", {"class": "MapKey"});

		this.container.appendChild(caption);
		this.container.appendChild(this.list);

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
	}
});
