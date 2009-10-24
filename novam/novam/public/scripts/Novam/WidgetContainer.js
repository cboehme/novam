/**
 * Class: Novam.WidgetContainer
 * A container for widgets.
 */
Novam.WidgetContainer = Class.create({

	widget: null,
	element: null,

	initialize: function (element) {
		this.element = $(element);
	},

	destroy: function () {
		this.unhingeWidget();
	},

	embedWidget: function (widget) {
		if (this.widget !== widget)
		{
			widget.embed(this);
			this.widget = widget;
		}
	},

	unhingeWidget: function () {
		if (this.widget)
		{
			this.widget.unhinge();
			this.widget = null;
		}
	},

	containsWidget: function () {
		return this.widget !== null;
	}
});
