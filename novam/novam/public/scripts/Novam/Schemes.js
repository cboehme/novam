Novam.schemes = [
	{
		id: "birmingham",
		name: "Birmingham",
		map_key: {
			"yellow": "Plain OSM stop without NaPTAN tags",
			"blue": "NaPTAN stop which is not shown in OSM (no highway=bus_stop)",
			"orange": "NaPTAN stop which is visible in OSM but is not tagged correctly",
			"green": "Completed stop without missing tags",
			"grey": "A stop which is not present on the ground"
		},
		get_stop_colour: function(stop) {
			if ("highway" in stop.tags 
				&& "naptan:AtcoCode" in stop.tags 
				&& (!("naptan:unverified" in stop.tags)
					|| (!("naptan:verified" in stop.tags) || stop.tags["naptan:verified"] == "yes")
				)
				&& "route_ref" in stop.tags
				&& "shelter" in stop.tags)
					return "green";
			else if (!("highway" in stop.tags)
				&& "naptan:AtcoCode" in stop.tags 
				&& ("naptan:unverified" in stop.tags 
					|| ("naptan:verified" in stop.tags && stop.tags["naptan:verified"] == "no")
				))
					return "blue";
			else if ("highway" in stop.tags
				&& !("naptan:AtcoCode" in stop.tags))
					return "yellow";
			else if (!("highway" in stop.tags)
				&& "naptan:AtcoCode" in stop.tags 
				&& stop.tags["physically_present"] == "no")
					return "grey";
			else
				return "orange";
		}
	},
	{
		id: "durham",
		name: "Durham",
		map_key: {
			"yellow": "A yellow stop",
			"blue": "A blue stop"
		},
		get_stop_colour: function(stop) {
			if ("highway" in stop.tags
				&& !("naptan:AtcoCode" in stop.tags)
				)
					return "yellow";
			else
				return "blue";
		}
	},
	{
		id: "peter_miller",
		name: "Peter Miller",
		map_key: {
			"yellow": "A yellow stop",
			"blue": "A blue stop",
			"green": "A green stop"
		},
		get_stop_colour: function(stop) {
			if ("highway" in stop.tags
				&& !("naptan:AtcoCode" in stop.tags)
				)
					return "yellow";
			else if (!("highway" in stop.tags)
				&& "naptan:AtcoCode" in stop.tags
				)
					return "blue";
			else if ("highway" in stop.tags
				&& "naptan:AtcoCode" in stop.tags
				&& (!("naptan:unverified" in stop.tags)
					|| (!("naptan:verified" in stop.tags) || stop.tags["naptan:verified"] == "yes")
				))
					return "green";
			else
				return "orange";
		}
	}
];
