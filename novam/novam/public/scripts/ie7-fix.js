/*
 * IE 7 does not provide correct width/height values if they were not set explicitly.
 * Since OpenLayers requires these values we set them here.
 */
function correct_dimensions()
{
	var panel = $("mapPanel");
	var map = $("map");

	map.style.width = panel.offsetWidth + "px";
	map.style.height = panel.offsetHeight + "px";
}

window.attachEvent("onload", correct_dimensions);
window.attachEvent("onresize", correct_dimensions);
