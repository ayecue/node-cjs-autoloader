# node-cjs-autoloader v0.1.3
[![Build Status](https://travis-ci.org/ayecue/node-cjs-autoloader.png?branch=master)](https://travis-ci.org/ayecue/node-cjs-autoloader)

> Search the path of a required script in a CommonJS project.


## Getting Started
Install this plugin with this command:

```shell
npm install node-cjs-autoloader
```


## Description

This Autoloader basicly search for requested files in a certain pattern. When the Autoloader finds something it'll return the absolute path to the file.


Basic example usage: 
```
var autoloader = new Autoloader();

autoloader.get(__filename,'grunt',function(path){
	console.log('grunt is here: ',path); //will print the full path to grunt
});
```


Advanced example usage: 
```
var autoloader = new Autoloader({
	debugging: true,
	dothrow: false,
	lookupDirectories: [
		'home',
		'usr',
		'somewhere'
	],
	onNewPackage: function(autoloader,pkg,nodeModule,json,moduleName,currDirectory){
		console.log('Successful reading package: ' + pkg);
	},
	onNewDirectory: function(autoloader,directory,sourceModule,targetModule,directories){
		console.log('Lookup directory: ' + directory);
	}
});

autoloader.get(__filename,'grunt',function(path){
	console.log('grunt is here: ',path); //will print the full path to grunt
});
```