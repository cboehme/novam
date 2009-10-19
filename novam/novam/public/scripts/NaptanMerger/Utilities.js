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
 * Get stop type
 */
function get_stop_type(stop) {
	if ('highway' in stop.tags 
		&& 'naptan:AtcoCode' in stop.tags 
		&& (!('naptan:unverified' in stop.tags)
			|| (!('naptan:verified' in stop.tags) || stop.tags['naptan:verified'] == 'yes')
		)
		&& 'route_ref' in stop.tags
		&& 'shelter' in stop.tags)
			return 'finished_stop';
	else if (!('highway' in stop.tags)
		&& 'naptan:AtcoCode' in stop.tags 
		&& ('naptan:unverified' in stop.tags 
			|| ('naptan:verified' in stop.tags && stop.tags['naptan:verified'] == 'no')
		))
			return 'plain_naptan_stop';
	else if ('highway' in stop.tags
		&& !('naptan:AtcoCode' in stop.tags))
			return 'plain_osm_stop';
	else if (!('highway' in stop.tags)
		&& 'naptan:AtcoCode' in stop.tags 
		&& stop.tags['physically_present'] == 'no')
			return 'no_physical_stop';
	else
		return 'merged_stop';
}

/*
 * Get and set cookies
 */
function setCookie(name, value)
{
	document.cookie = name+"="+escape(value)+";";
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
