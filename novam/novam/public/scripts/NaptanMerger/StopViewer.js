/**
 * Class: NaptanMerger.StopViewer
 * A widget to show a bus stop and allow merging it.
 */
NaptanMerger.StopViewer = Class.create(NaptanMerger.Widget, {
	
	model:null,
	list: null,

	initialize: function(model) {
		NaptanMerger.Widget.prototype.initialize.call(this);

		this.model = model;
		this.model.events.register("stop_highlighted", this, this.stop_highlighted);
		this.model.events.register("stop_unhighlighted", this, this.stop_unhighlighted);
		this.model.events.register("stop_selected", this, this.stop_selected);
		this.model.events.register("stop_unselected", this, this.stop_unselected);
		this.model.events.register("stop_updated", this, this.stop_updated);

		var caption = new Element('h2', {'class': 'StopViewer'});
		caption.appendChild(Text('Bus Stop'));

		this.list = new Element('dl', {'class': 'StopViewer'});

		this.container.appendChild(caption);
		this.container.appendChild(this.list);

		this.set_stop(null);
	},

	set_stop: function(stop) {

		function appendItem(key, value) {
			var dt = new Element('dt');
			var dd = new Element('dd');

			dt.appendChild(Text(key));
			dd.appendChild(Text(value));

			this.list.appendChild(dt);
			this.list.appendChild(dd);
		}
		
		this.list.removeChildren();
		if (stop === null)
			appendItem.call(this, 'No Stop Selected', '');
		else
		{
			var tags = [];
			for(tag in stop.tags)
				tags.push(tag);
			tags.sort();
			for (var i = 0; i < tags.length; ++i)
			{
				tag = tags[i];
				if (tag.substring(0,7) == "naptan:")
					shortenedTag = tag.substring(7);
				else
					shortenedTag = tag;
				appendItem.call(this, shortenedTag+': ', stop.tags[tag]);
			}
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

});
