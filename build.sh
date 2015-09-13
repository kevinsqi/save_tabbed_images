#!/usr/bin/env bash

./node_modules/.bin/browserify -t reactify -o extension/js_packaged/popup.js extension/js_src/popup.jsx
