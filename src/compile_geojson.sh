#!/bin/bash

TMPFILE=`mktemp`;
SIMPLIFY_AMT=$1;

geo2topo streets=streets.geojson \
         water=water.geojson \
         bball=bball.geojson > $TMPFILE

toposimplify -F -P $SIMPLIFY_AMT $TMPFILE > basemap.json

echo $TMPFILE
echo $SIMPLIFY_AMT
rm $TMPFILE

exit 0;
