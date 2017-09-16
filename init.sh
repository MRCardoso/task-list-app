#!/bin/bash

if [ -d node_modules/ ] ; then
	ionic serve
else
	npm install && bower install && ionic serve
fi
