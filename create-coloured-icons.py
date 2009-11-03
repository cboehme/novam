#!/usr/bin/python

import sys
import subprocess
import os

colours = [
	("yellow", "c4a000", "fce94f", "cc0000"),
	("green", "4e9a06", "73d216", "cc0000"),
	("orange", "ce5c00", "fcaf3e", "cc0000"),
	("blue", "204a87", "729fcf", "cc0000"),
	("purple", "75507b", "ad7fa8", "cc0000"),
	("brown", "c17d11", "e9b96e", "cc0000"),
	("red", "cc0000", "ef2929", "a40000"),
	("grey", "888a85", "babdb6", "cc0000")
]

if len(sys.argv) != 3:
	print "Usage:", sys.argv[0], "SRC-FILE DEST-BASE"
	sys.exit(-1)

src = sys.argv[1]
dest = sys.argv[2]

for colour in colours:
	cmd = "./create-icon-states.sh %s %s_%s %s %s %s" % ((src, colour[0], dest)+colour[1:])
	subprocess.call(cmd, shell=True, cwd=os.getcwd())
