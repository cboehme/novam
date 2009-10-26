Novam.schemes = [
	{
		id: "birmingham",
		name: "Birmingham",
		map_key: {
			"yellow_stop": "Plain OSM stop without NaPTAN tags",
			"blue_stop": "NaPTAN stop without bus stop tag",
			"orange_stop": "NaPTAN stop tagged as a bus stop but with missing tags",
			"green_stop": "Completed stop without missing tags",
			"grey_stop": "A stop which is not present on the ground"
		},
		get_stop_icon: function(stop) {

			if ("highway" in stop.tags 
				&& "naptan:AtcoCode" in stop.tags 
				&& (!("naptan:unverified" in stop.tags)
					|| (!("naptan:verified" in stop.tags) || stop.tags["naptan:verified"] == "yes")
				)
				&& "route_ref" in stop.tags
				&& "shelter" in stop.tags)
					return "green_stop";

			else if (!("highway" in stop.tags)
				&& "naptan:AtcoCode" in stop.tags 
				&& ("naptan:unverified" in stop.tags 
					|| ("naptan:verified" in stop.tags && stop.tags["naptan:verified"] == "no")
				))
					return "blue_stop";

			else if ("highway" in stop.tags
				&& !("naptan:AtcoCode" in stop.tags))
					return "yellow_stop";

			else if (!("highway" in stop.tags)
				&& "naptan:AtcoCode" in stop.tags 
				&& stop.tags["physically_present"] == "no")
					return "grey_stop";

			else
				return "orange_stop";
		},
		get_missing_tags: function(stop) {
			tags = {};

			if (!("shelter" in stop.tags))
				tags["shelter"] = "Missing: Has this stop a shelter?";

			if (!("route_ref" in stop.tags))
				tags["route_ref"] = "Missing: Routes stopping at the stop";

			if (!("highway" in stop.tags))
				tags["highway"] = "=bus_stop is missing";

			if (!("naptan:AtcoCode" in stop.tags))
				tags["naptan:*"] = "Naptan tags are (partly) missing";

			return tags;
		},
		get_invalid_tags: function(stop) {
			tags = {};

			if ("naptan:unverified" in stop.tags && stop.tags["naptan:unverified"] != "no")
				tags["naptan:unverified"] = "Delete this tag or set it to \u2018no\u2019";

			if ("naptan:verified" in stop.tags && stop.tags["naptan:verified"] != "yes")
				tags["naptan:verified"] = "Delete this tag or set it to \u2018yes\u2019";

			if ("shelter" in stop.tags 
				&& stop.tags["shelter"] != "no" 
				&& stop.tags["shelter"] != "yes"
				)
					tags["shelter"] = "Must be either \u2018yes\u2019 or \u2018no\u2019";

			return tags;
		}
	},
	{
		id: "hull",
		name: "Hull (Chris Hill)",
		map_key: {
			"blue_stop": "Surveyed stop which has no NaPTAN tags",
			"red_stop": "NaPTAN Stop that has not been checked yet",
			"purple_stop": "Stop with problems described in the note tag", 
			"green_stop": "Stop has been checked and is okay",
			"grey_stop": "Stop from NaPTAN which is not on the ground"
		},
		get_stop_icon: function(stop) {

			if (!("highway" in stop.tags) 
				&& "naptan:AtcoCode" in stop.tags)
					return "grey_stop";

			else if ("highway" in stop.tags 
				&& !("naptan:AtcoCode" in stop.tags))
					return "blue_stop";

			else if ("highway" in stop.tags
				&& (("naptan:verified" in stop.tags && stop.tags["naptan:verified"] == "no")
				|| ("naptan:unverified" in stop.tags && stop.tags["naptan:unverified"] == "yes")))
					return "red_stop";

			else if ("highway" in stop.tags
				&& ((!("naptan:verified" in stop.tags) || stop.tags["naptan:verified"] != "no")
					|| (!("naptan:unverified" in stop.tags) || stop.tags["naptan:unverified"] != "yes"))
				&& "note" in stop.tags)
					return "purple_stop";

			else if ("highway" in stop.tags
				&& ((!("naptan:verified" in stop.tags) || stop.tags["naptan:verified"] != "no")
					|| (!("naptan:unverified" in stop.tags) || stop.tags["naptan:unverified"] != "yes"))
				&& !("note" in stop.tags))
					return "green_stop";

			else
				return "yellow_stop";
		},
		get_missing_tags: function(stop) {
			tags = {};

			if (!("highway" in stop.tags))
				tags["highway"] = "=bus_stop is missing";

			if (!("naptan:AtcoCode" in stop.tags))
				tags["naptan:*"] = "Naptan tags are (partly) missing";

			return tags;
		},
		get_invalid_tags: function(stop) {
			tags = {};
			if ("naptan:unverified" in stop.tags && stop.tags["naptan:unverified"] != "no")
				tags["naptan:unverified"] = "Delete this tag or set it to \u2018no\u2019";

			if ("naptan:verified" in stop.tags && stop.tags["naptan:verified"] != "yes")
				tags["naptan:verified"] = "Delete this tag or set it to \u2018yes\u2019";
			
			if ("note" in stop.tags)	
				tags["note"] = "This note needs to be removed to complete the stop";

			return tags;
		}
	},
	{
		id: "peter_miller",
		name: "Peter Miller",
		map_key: {
			"yellow_stop": "A yellow stop",
			"blue_stop": "A blue stop",
			"green_stop": "A green stop"
		},
		get_stop_icon: function(stop) {
			if ("highway" in stop.tags
				&& !("naptan:AtcoCode" in stop.tags)
				)
					return "yellow_stop";
			else if (!("highway" in stop.tags)
				&& "naptan:AtcoCode" in stop.tags
				)
					return "blue_stop";
			else if ("highway" in stop.tags
				&& "naptan:AtcoCode" in stop.tags
				&& (!("naptan:unverified" in stop.tags)
					|| (!("naptan:verified" in stop.tags) || stop.tags["naptan:verified"] == "yes")
				))
					return "green_stop";
			else
				return "orange_stop";
		},
		get_missing_tags: function(stop) {
			return {};
		},
		get_invalid_tags: function(stop) {
			return {};
		}
	}
];
