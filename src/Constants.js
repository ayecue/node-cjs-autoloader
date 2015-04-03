/*
 * node-cjs-autoloader
 * https://github.com/ayecue/node-cjs-autoloader
 *
 * Copyright (c) 2015 "AyeCue" Sören Wehmeier, contributors
 * Licensed under the MIT license.
 */
'use strict';

exports.AUTOLOADER = {
	RELATIVE: /^\.\//,
	RELATIVE_BACK: /^\.\.\//,
	LAST_DIR: /\/?[^\/]+\/?$/,
	EXTENSION: /\.js$/i,
	EMPTY: /^\/?$/
};

exports.READ = {
	ENCODING: 'utf8',
	FLAG: 'r'
};

console.log(process.env.NODE_PATH);

exports.PACKAGES = {
	HOME: process.env.NODE_PATH || '/usr/lib/nodejs:/usr/lib/node_modules:/usr/share/javascript',
	FILE_NAME: 'package.json',
	DIR_NAME: 'node_modules'
};

exports.ERRORS = {
	AUTOLOADER_GET_FILE : 'Cannot find file: ',
	AUTOLOADER_GET_MODULE : 'Cannot find file: ',
	AUTOLOADER_EMPTY_PACKAGE_MAIN : 'Empty main in package: '
};