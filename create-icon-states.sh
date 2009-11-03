#!/bin/bash

if [ $# -ne 5 ] ; then
	echo "usage: $0 SRC DEST-BASE BOX-STROKE BOX-FILL SELECTED"
	echo "#00ff00 (green) is replaced with BOX-STROKE/SELECTED"
	echo "#ff00ff (pink) is replaced with BOX-FILL"
	echo "#ffff00 (yellow) is replaced with #2e3436/SELECTED"
	exit -1
fi

SRC_FILE=$1
DEST_BASE=$2
BOX_STROKE=$3
BOX_FILL=$4
SELECTED=$5

ICON=2e3436

# not selected, not highlighted:
sed "s/stroke:#00ff00;/stroke:#${BOX_STROKE};/g; \
     s/fill:#ff00ff;/fill:#${BOX_FILL};/g; \
     s/stroke:#ffff00;/stroke:#${ICON};/g; \
     s/fill:#ffff00;/fill:#${ICON};/g;" < ${SRC_FILE} > /tmp/create-icons.svg

inkscape --without-gui --file=/tmp/create-icons.svg --export-png=${DEST_BASE}.png \
	--export-area-drawing --export-width=16 --export-height=16

# not selected, highlighted:
sed "s/stroke:#00ff00;/stroke:#${SELECTED};/g; \
     s/fill:#ff00ff;/fill:#${BOX_FILL};/g; \
     s/stroke:#ffff00;/stroke:#${ICON};/g; \
     s/fill:#ffff00;/fill:#${ICON};/g;" < ${SRC_FILE} > /tmp/create-icons.svg

inkscape --without-gui --file=/tmp/create-icons.svg --export-png=${DEST_BASE}_highlighted.png \
	--export-area-drawing --export-width=22 --export-height=22

# selected, not highlighted:
sed "s/stroke:#00ff00;/stroke:#${SELECTED};/g; \
     s/fill:#ff00ff;/fill:#${BOX_FILL};/g; \
     s/stroke:#ffff00;/stroke:#${SELECTED};/g; \
     s/fill:#ffff00;/fill:#${SELECTED};/g;" < ${SRC_FILE} > /tmp/create-icons.svg

inkscape --without-gui --file=/tmp/create-icons.svg --export-png=${DEST_BASE}_selected.png \
	--export-area-drawing --export-width=16 --export-height=16

# selected, highlighted:
# same colours as "selected, not highlighted" but at a different size.
inkscape --without-gui --file=/tmp/create-icons.svg --export-png=${DEST_BASE}_selected_highlighted.png \
	--export-area-drawing --export-width=22 --export-height=22
