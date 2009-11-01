/**
 * Class: Novam.SchemeSelector
 * A widget to select a colour scheme for the bus stops.
 */
Novam.SchemeSelector = Class.create(Novam.Widget, {
	
	model: null,
	selector: null,

	initialize: function(model) {
		Novam.Widget.prototype.initialize.call(this);

		this.model = model;
		this.model.events.register("scheme_added", this, this.scheme_added);
		this.model.events.register("scheme_selected", this, this.scheme_selected);
		this.model.events.register("scheme_unselected", this, this.scheme_unselected);

		this.selector = new Element("select", {"size": "1"});
		this.selector.observe("change", function(evt) {
			this.model.select_scheme(this.selector.value);
		}.bind(this));

		this.selector.appendChild(new Element("option", {"value": ""}));

		var label = new Element("label", {"for": this.selector.id});
		label.appendChild(Text("Select Scheme"));
		
		var caption = new Element("h2", {"class": "SchemeSelector"});
		caption.appendChild(Text("Colour Scheme"));

		var fieldset = new Element("fieldset", {"class": "SchemeSelector"});
		fieldset.appendChild(label);
		fieldset.appendChild(this.selector);

		this.container.appendChild(caption);
		this.container.appendChild(fieldset);

		Novam.schemes.each(this.model.add_scheme, this.model);

		// Load saved scheme:
		params = OpenLayers.Util.getParameters(location.href);
		if (params.scheme != undefined) {
			this.model.select_scheme(params.scheme);
		} 
		if (!this.model.selected_scheme) {
			cookie = getCookie("scheme");
			if (cookie != null) {
				this.model.select_scheme(cookie);
			}
		}
	},

	scheme_added: function(scheme) {
		var option = new Element("option", {"value": scheme.id});
		option.appendChild(Text(scheme.name));

		this.selector.appendChild(option);
	},
	
	scheme_selected: function(scheme) {
		this.selector.value = scheme.id;
		setCookie("scheme", scheme.id);
	},

	scheme_unselected: function(scheme) {
		this.selector.value = "";
	}
});
