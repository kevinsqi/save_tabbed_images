#!/usr/bin/env bash

# Borrowed from https://github.com/BinaryMuse/chrome-fast-tab-switcher

./node_modules/.bin/browserify -t reactify -o extension/js_packaged/popup.js extension/js_src/popup.jsx
