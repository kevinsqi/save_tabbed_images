#!/usr/bin/env bash

# Borrowed from https://github.com/BinaryMuse/chrome-fast-tab-switcher

mkdir -p dist/js

./node_modules/.bin/browserify -t reactify -o dist/js/popup.js js/popup.jsx

cp js/background.js dist/js/background.js
