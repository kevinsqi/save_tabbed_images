#!/usr/bin/env bash

# Borrowed from https://github.com/BinaryMuse/chrome-fast-tab-switcher

mkdir -p dist/js

./node_modules/.bin/browserify -t reactify -o dist/js/popup.js js/popup.jsx
./node_modules/.bin/browserify -o dist/js/background.js js/background.js
