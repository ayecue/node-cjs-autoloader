/*
 * node-cjs-autoloader
 * https://github.com/ayecue/node-cjs-autoloader
 *
 * Copyright (c) 2015 "AyeCue" Sören Wehmeier, contributors
 * Licensed under the MIT license.
 */
'use strict';

module.exports = (function(
	fs,
	JSON,
	path,
	async,
	Manipulator,
	CONSTANTS
){
	function Autoloader(options){
		var me = this;

		options = options || {};

		me.onNewPackage = options.onNewPackage;
		me.onNewDirectory = options.onNewDirectory;
		me.lookupDirectories = options.lookupDirectories || [];
		me.debugging = options.debugging || false;
		me.dothrow = options.dothrow || false;
	}

	Autoloader.defaultDirectories = CONSTANTS.PACKAGES.HOME.split(':');

	Autoloader.read = function(packagePath){
		if (packagePath && fs.statSync(packagePath).isFile()) {
			return JSON.parse(fs.readFileSync(packagePath,{
				encoding : CONSTANTS.READ.ENCODING,
				flag : CONSTANTS.READ.FLAG
			}));
		}
	};

	Autoloader.prototype = {
		self: Autoloader,

		doThrow: function(message){
			if (this.dothrow) {
				throw new Error(message);
			} else if (this.debugging) {
				console.error(message);
			}
		},

		existFile: function(file){
			return fs.existsSync(file) && fs.statSync(file).isFile();
		},

		existDirectory: function(dir){
			return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
		},

		searchForModule: function(moduleName,currDirectory){
			var me = this;

			moduleName = Manipulator.extension(moduleName);
			moduleName = path.join(currDirectory,moduleName);

			if (me.existFile(moduleName)) {
				return moduleName;
			}
		},

		searchForPackage: function(moduleName,currDirectory){
			var me = this,
				nodeModule = path.resolve(currDirectory,moduleName), 
				pkg, json;

			if (!me.existDirectory(nodeModule)) {
				nodeModule = path.join(CONSTANTS.PACKAGES.DIR_NAME,moduleName);
				nodeModule = path.resolve(currDirectory,nodeModule);
			}

			if (!me.existDirectory(nodeModule)) {
				return;
			}

			pkg = path.join(nodeModule,CONSTANTS.PACKAGES.FILE_NAME);
			json = me.self.read(pkg);

			if (!json) {
				return;
			}

			if (!json.main) {
				return me.doThrow(CONSTANTS.ERRORS.AUTOLOADER_EMPTY_PACKAGE_MAIN + pkg);
			}

			if (me.onNewPackage) {
				me.onNewPackage(me,pkg,nodeModule,json,moduleName,currDirectory);
			}

			return path.resolve(nodeModule,json.main);
		},

		searchSync: function(moduleName,currDirectory){
			return this.searchForModule(moduleName,currDirectory) || 
				this.searchForPackage(moduleName,currDirectory);
		},

		search: function(moduleName,currDirectory,done){
			var me = this,
				found;

			async.detect([
				me.searchForModule,
				me.searchForPackage
			],function(searchCallback,done){
				if (found) {
					return;
				}

				found = searchCallback.call(me,moduleName,currDirectory);
				done(!!found);
			},function(){
				done(found);
			});
		},

		walkup: function(directory){
			directory = path.resolve(directory,'..');
			directory = path.normalize(directory);

			return directory;
		},

		collect: function(sourceDirectory) {
			var me = this,
				list = [];

			sourceDirectory = path.dirname(sourceDirectory);
			sourceDirectory = path.resolve(sourceDirectory);

			for (; !Manipulator.isEmpty(sourceDirectory); sourceDirectory = me.walkup(sourceDirectory)) {
				list.push(sourceDirectory);
			}

			return list.concat(me.self.defaultDirectories,me.lookupDirectories);
		},

		walkSync: function(sourceModule,targetModule){
			var me = this,
				directories = me.collect(sourceModule),
				index = 0,
				length = directories.length,
				directory,
				module;

			for (; index < length; index++) {
				directory = directories[index];

				if (me.onNewDirectory) {
					me.onNewDirectory(me,directory,sourceModule,targetModule,directories);
				}

				module = me.searchSync(targetModule,directory);

				if (module) {
					return module;
				}
			}
		},

		walk: function(sourceModule,targetModule,done){
			var me = this,
				directories = me.collect(sourceModule),
				found;

			async.detect(directories,function(directory,done){
				if (found) {
					return;
				}

				if (me.onNewDirectory) {
					me.onNewDirectory(me,directory,sourceModule,targetModule,directories);
				}

				me.search(targetModule,directory,function(result){
					found = result
					done(!!found);
				});
			},function(){
				done(found);
			});
		},

		isRelative: function(module,start){
			return module.charAt(start || 0) === '.';
		},

		getByRelative: function(sourceModule,targetModule){
			var me = this,
				module, directory;

			if (me.isRelative(targetModule)) {
				directory = path.dirname(sourceModule);

				if (me.isRelative(targetModule,1)) {
					directory = Manipulator.removeLastDirectory(directory);
					module = Manipulator.relativeUp(targetModule,directory);
				} else {
					module = Manipulator.relative(targetModule,directory);
				}

				if (!module) {
					return me.doThrow(CONSTANTS.ERRORS.AUTOLOADER_GET_FILE + targetModule);
				}

				module = path.normalize(module);
				module = Manipulator.extension(module);
			}

			return module;
		},

		getBySearchSync: function(sourceModule,targetModule){
			var me = this,
				module = me.walkSync(sourceModule,targetModule);

			if (!module) {
				return me.doThrow(CONSTANTS.ERRORS.AUTOLOADER_GET_FILE + targetModule);
			}

			module = path.normalize(module);
			module = Manipulator.extension(module);

			return module;
		},

		getBySearch: function(sourceModule,targetModule,done){
			var me = this;

			me.walk(sourceModule,targetModule,function(module){
				if (!module) {
					return me.doThrow(CONSTANTS.ERRORS.AUTOLOADER_GET_FILE + targetModule);
				}

				module = path.normalize(module);
				module = Manipulator.extension(module);

				done(module);
			});
		},

		ifPackage: function(module){
			var me = this,
				json;

			if (/.json$/i.test(module)) {
				json = me.self.read(pkg);

				if (!json) {
					return;
				}

				if (!json.main) {
					return me.doThrow(CONSTANTS.ERRORS.AUTOLOADER_EMPTY_PACKAGE_MAIN + pkg);
				}

				module = path.resolve(module,json.main);
			}

			return module;
		},

		getSync: function(sourceModule,targetModule){
			var me = this,
				module;

			targetModule = me.ifPackage(targetModule);

			if (me.isRelative(targetModule)) {
				return me.getByRelative(sourceModule,targetModule);
			} else {
				return me.getBySearchSync(sourceModule,targetModule);
			}
		},

		get: function(sourceModule,targetModule,done){
			var me = this,
				json;

			targetModule = me.ifPackage(targetModule);

			if (me.isRelative(targetModule)) {
				done(me.getByRelative(sourceModule,targetModule));
			} else {
				me.getBySearch(sourceModule,targetModule,done);
			}
		}
	};

	return Autoloader;
})(
	require('fs'),
	require('JSON2'),
	require('path'),
	require('async'),
	require('./Manipulator'),
	require('./Constants')
);