#!/usr/bin/python

from PIL import Image
from glob import glob

files = glob("*_bearing_N.png") + glob("*_bearing_NW.png")
states = ["", "_selected", "_highlighted", "_selected_highlighted"]
dirs = {
	"N": ("W", "S", "E"), 
	"NW": ("SW", "SE", "NE")
}

for f in files:
	base = f[:-4]
	dir = base[-2:]
	if dir == "_N": dir = "N"
	base = base[:-len(dir)]

	for s in states:
		src = Image.open("%s%s%s.png" % (base, dir, s))

		dest = src.transpose(Image.ROTATE_90)
		dest.save("%s%s%s.png" % (base, dirs[dir][0], s), "PNG")

		dest = src.transpose(Image.ROTATE_180)
		dest.save("%s%s%s.png" % (base, dirs[dir][1], s), "PNG")

		dest = src.transpose(Image.ROTATE_270)
		dest.save("%s%s%s.png" % (base, dirs[dir][2], s), "PNG")

