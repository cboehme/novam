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

/*
 * Utility functions
 */

function regExpEscape(text)
{
	var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
	return String(text).replace(new RegExp('(\\' + specials.join('|\\') + ')', 'g'), '\\$1');
}

/*
 * Create a unique id number
 */
function uniqueId()
{
	return uniqueId.nextId++;
}
uniqueId.nextId = 0;

/*
 * Get and set cookies
 */
function setCookie(name, value)
{
	var expires = new Date();
	expires.setTime(expires.getTime() + 1000 * 86400 * 60);  // Cookie will expire in 60 days

	document.cookie = name + "=" + escape(value) + "; expires=" + expires.toGMTString();
}

function getCookie(name)
{
	if (document.cookie)
	{
		var cookies = document.cookie.split(";");
		for(var i = 0; i < cookies.length; ++i)
		{
			c = cookies[i].split("=");
			if (c[0].strip() == name)  return unescape(c[1].strip());
		}
	}
	return undefined;
}


/*
 * DOM Utilities
 */
Element.addMethods({
	removeChildren: function (element) {
		while (element.hasChildNodes())
			element.removeChild(element.firstChild);
	},
	replaceChildren: function (element, newChildren) {
		element.removeChildren();
		if (Object.isArray(newChildren))
		{
			for (var i = 0; i < newChildren.length; ++i)
				element.appendChild(newChildren[i]);
		}
		else
			element.appendChild(newChildren);
	},
	insertAfter: function (element, newElement, predecessor) {
		element.insertBefore(newElement, predecessor.nextSibling);
	},
	findLabelFor: function (element, label_element) {
		var labels = element.getElementsByTagName("label");

		for (var i = 0; i < labels.length; ++i)
			if (labels[i].htmlFor == $(label_element).id)
				return labels[i];

		return null;
	}
});

function Text(str)
{
	return document.createTextNode(str);
}

function Elem(name, attrs)
{
	var element = new Element(name, attrs);
	var args = [];
	for (var i = 2; i < arguments.length; ++i) {
		args.push(arguments[i]);
	}
	element.appendChild(concatElements.apply(this, args));
	return element;
}

function Fragment()
{
	return concatElements.apply(this, arguments);
}

function concatElements()
{
	var fragment = document.createDocumentFragment();
	for (var i = 0; i < arguments.length; ++i)
	{
		if (typeof(arguments[i]) == 'string')
			fragment.appendChild(Text(arguments[i]));
		else
			fragment.appendChild(arguments[i]);
	}
	return fragment;
}

function findLabelFor(element)
{
	var labels = document.getElementsByTagName("label");

	for (var i = 0; i < labels.length; ++i)
		if (labels[i].htmlFor == $(element).id)
			return labels[i];

	return null;
}
