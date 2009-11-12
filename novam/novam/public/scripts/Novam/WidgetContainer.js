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
