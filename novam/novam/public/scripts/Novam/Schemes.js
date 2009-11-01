Novam.schemes = [
	{
		id: "birmingham",
		name: "Birmingham",
		map_key: {
			"yellow_stop": "Plain OSM stop without NaPTAN tags",
			"blue_stop": "NaPTAN stop without bus stop tag",
			"orange_stop": "NaPTAN stop tagged as a bus stop but with missing tags",
			"green_stop": "Completed stop without missing tags",
			"grey_stop": "A stop which is not present on the ground",
			"grey_bearing_NW": "Arrows indicate the value of naptan:Bearing"
		},
		z_order: [
			"green_stop", 
			"green_bearing_N", "green_bearing_W", "green_bearing_S", "green_bearing_E", 
			"green_bearing_NW", "green_bearing_SW", "green_bearing_SE", "green_bearing_NE",
			"grey_stop", 
			"grey_bearing_N", "grey_bearing_W", "grey_bearing_S", "grey_bearing_E", 
			"grey_bearing_NW", "grey_bearing_SW", "grey_bearing_SE", "grey_bearing_NE",
			"yellow_stop", 
			"yellow_bearing_N", "yellow_bearing_W", "yellow_bearing_S", "yellow_bearing_E", 
			"yellow_bearing_NW", "yellow_bearing_SW", "yellow_bearing_SE", "yellow_bearing_NE",
			"blue_stop", 
			"blue_bearing_N", "blue_bearing_W", "blue_bearing_S", "blue_bearing_E", 
			"blue_bearing_NW", "blue_bearing_SW", "blue_bearing_SE", "blue_bearing_NE",
			"orange_stop",
			"orange_bearing_N", "orange_bearing_W", "orange_bearing_S", "orange_bearing_E", 
			"orange_bearing_NW", "orange_bearing_SW", "orange_bearing_SE", "orange_bearing_NE"
		],
		get_stop_icon: function(stop) {
			var bearings = ["N", "NW", "W", "SW", "S", "SE", "E", "NE"];
			var icon = "_stop";
			if ("naptan:Bearing" in stop.tags && bearings.indexOf(stop.tags["naptan:Bearing"]) != -1) {
				icon = "_bearing_" + stop.tags["naptan:Bearing"];
			}

			if ("highway" in stop.tags 
				&& "naptan:AtcoCode" in stop.tags 
				&& (!("naptan:unverified" in stop.tags)
					&& (!("naptan:verified" in stop.tags) || stop.tags["naptan:verified"] == "yes")
				)
				&& "route_ref" in stop.tags
				&& "shelter" in stop.tags)
					return "green"+icon;

			else if (!("highway" in stop.tags)
				&& "naptan:AtcoCode" in stop.tags 
				&& ("naptan:unverified" in stop.tags 
					|| ("naptan:verified" in stop.tags && stop.tags["naptan:verified"] == "no")
				))
					return "blue"+icon;

			else if ("highway" in stop.tags
				&& !("naptan:AtcoCode" in stop.tags))
					return "yellow"+icon;

			else if (!("highway" in stop.tags)
				&& "naptan:AtcoCode" in stop.tags 
				&& stop.tags["physically_present"] == "no")
					return "grey"+icon;

			else
				return "orange"+icon;
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
			"orange_stop": "Stop with problems described in the note tag", 
			"green_stop": "Stop has been checked and is okay",
			"grey_stop": "Stop from NaPTAN which is not on the ground",
			"yellow_stop": "All other stops",
			"grey_bearing_NW": "Arrows indicate the value of naptan:Bearing"
		},
		z_order: [
			"green_stop", 
			"green_bearing_N", "green_bearing_W", "green_bearing_S", "green_bearing_E", 
			"green_bearing_NW", "green_bearing_SW", "green_bearing_SE", "green_bearing_NE",
			"grey_stop", 
			"grey_bearing_N", "grey_bearing_W", "grey_bearing_S", "grey_bearing_E", 
			"grey_bearing_NW", "grey_bearing_SW", "grey_bearing_SE", "grey_bearing_NE",
			"blue_stop", 
			"blue_bearing_N", "blue_bearing_W", "blue_bearing_S", "blue_bearing_E", 
			"blue_bearing_NW", "blue_bearing_SW", "blue_bearing_SE", "blue_bearing_NE",
			"yellow_stop", 
			"yellow_bearing_N", "yellow_bearing_W", "yellow_bearing_S", "yellow_bearing_E", 
			"yellow_bearing_NW", "yellow_bearing_SW", "yellow_bearing_SE", "yellow_bearing_NE",
			"red_stop", 
			"red_bearing_N", "red_bearing_W", "red_bearing_S", "red_bearing_E", 
			"red_bearing_NW", "red_bearing_SW", "red_bearing_SE", "red_bearing_NE",
			"orange_stop",
			"orange_bearing_N", "orange_bearing_W", "orange_bearing_S", "orange_bearing_E", 
			"orange_bearing_NW", "orange_bearing_SW", "orange_bearing_SE", "orange_bearing_NE"
		],
		get_stop_icon: function(stop) {
			var bearings = ["N", "NW", "W", "SW", "S", "SE", "E", "NE"];
			var icon = "_stop";
			if ("naptan:Bearing" in stop.tags && bearings.indexOf(stop.tags["naptan:Bearing"]) != -1) {
				icon = "_bearing_" + stop.tags["naptan:Bearing"];
			}

			if (!("highway" in stop.tags) 
				&& "naptan:AtcoCode" in stop.tags)
					return "grey"+icon;

			else if ("highway" in stop.tags 
				&& !("naptan:AtcoCode" in stop.tags))
					return "blue"+icon;

			else if ("highway" in stop.tags
				&& (("naptan:verified" in stop.tags && stop.tags["naptan:verified"] == "no")
				|| ("naptan:unverified" in stop.tags && stop.tags["naptan:unverified"] == "yes")))
					return "red"+icon;

			else if ("highway" in stop.tags
				&& ((!("naptan:verified" in stop.tags) || stop.tags["naptan:verified"] != "no")
					|| (!("naptan:unverified" in stop.tags) || stop.tags["naptan:unverified"] != "yes"))
				&& "note" in stop.tags)
					return "orange"+icon;

			else if ("highway" in stop.tags
				&& ((!("naptan:verified" in stop.tags) || stop.tags["naptan:verified"] != "no")
					|| (!("naptan:unverified" in stop.tags) || stop.tags["naptan:unverified"] != "yes"))
				&& !("note" in stop.tags))
					return "green"+icon;

			else
				return "yellow"+icon;
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
			"yellow_stop": "Stop which has no NaPTAN tags",
			"blue_stop": "Unverified NaPTAN stop",
			"orange_stop": "Verified NaPTAN stop with missing tags",
			"green_stop": "Completed stop",
			"grey_bearing_NW": "Arrows indicate the value of naptan:Bearing"
		},
		z_order: [
			"green_stop", 
			"green_bearing_N", "green_bearing_W", "green_bearing_S", "green_bearing_E", 
			"green_bearing_NW", "green_bearing_SW", "green_bearing_SE", "green_bearing_NE",
			"yellow_stop",
			"yellow_bearing_N", "yellow_bearing_W", "yellow_bearing_S", "yellow_bearing_E", 
			"yellow_bearing_NW", "yellow_bearing_SW", "yellow_bearing_SE", "yellow_bearing_NE",
			"orange_stop", 
			"orange_bearing_N", "orange_bearing_W", "orange_bearing_S", "orange_bearing_E", 
			"orange_bearing_NW", "orange_bearing_SW", "orange_bearing_SE", "orange_bearing_NE",
			"blue_stop", 
			"blue_bearing_N", "blue_bearing_W", "blue_bearing_S", "blue_bearing_E", 
			"blue_bearing_NW", "blue_bearing_SW", "blue_bearing_SE", "blue_bearing_NE"
		],
		get_stop_icon: function(stop) {
			var bearings = ["N", "NW", "W", "SW", "S", "SE", "E", "NE"];
			var icon = "_stop";
			if ("naptan:Bearing" in stop.tags && bearings.indexOf(stop.tags["naptan:Bearing"]) != -1) {
				icon = "_bearing_" + stop.tags["naptan:Bearing"];
			}

			if ("highway" in stop.tags
				&& !("naptan:AtcoCode" in stop.tags)
				)
					return "yellow"+icon;
			else if ("naptan:AtcoCode" in stop.tags
				&& (("naptan:verified" in stop.tags && stop.tags["naptan:verified"] == "no")
				|| ("naptan:unverified" in stop.tags && stop.tags["naptan:unverified"] == "yes"))
				)
					return "blue"+icon;
			else if (!("highway" in stop.tags)
				|| !("naptan:AtcoCode" in stop.tags)
				|| ("naptan:unverified" in stop.tags && stop.tags["naptan:unverified"] != "no")
				|| ("naptan:verified" in stop.tags && stop.tags["naptan:verified"] != "yes")
				|| ("shelter" in stop.tags && stop.tags["shelter"] != "yes" && stop.tags["shelter"] != "no")
				)
					return "orange"+icon;
			else
				return "green"+icon;
		},
		get_missing_tags: function(stop) {
			tags = {};
			if (!("highway" in stop.tags))
				tags["highway"] = "=bus_stop is missing";

			if (!("naptan:AtcoCode" in stop.tags))
				tags["naptan:*"] = "Naptan tags are (partly) missing";

			if (!("shelter" in stop.tags))
				tags["shelter"] = "Missing: Has this stop a shelter?";

			return tags;
		},
		get_invalid_tags: function(stop) {
			tags = {};
			if ("naptan:unverified" in stop.tags && stop.tags["naptan:unverified"] != "no")
				tags["naptan:unverified"] = "Delete this tag or set it to \u2018no\u2019";

			if ("naptan:verified" in stop.tags && stop.tags["naptan:verified"] != "yes")
				tags["naptan:verified"] = "Delete this tag or set it to \u2018yes\u2019";
			
			if ("shelter" in stop.tags && (stop.tags["shelter"] != "no" && stop.tags["shelter"] != "yes"))
				tags["shelter"] = "Must be either \u2018yes\u2019 or \u2018no\u2019";

			return tags;
		}
	}
];
