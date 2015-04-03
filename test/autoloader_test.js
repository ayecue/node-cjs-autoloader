'use strict';

var Autoloader = require('../src/Autoloader');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.klass = {
    setUp: function(done) {
        // setup here if necessary
        done();
    },
    sync: function(test) {
        var autoloaderInstance = new Autoloader(),
            actual,expected;


        expected = 'fixtures/a.js';
        actual = autoloaderInstance.getSync(__filename,'./fixtures/a.js');

        test.ok(actual.indexOf(expected) !== -1, 'path should contain ' + expected);
        test.done();
    },
    async: function(test) {
        var autoloaderInstance = new Autoloader(),
            actual,expected;


        expected = 'fixtures/a.js';
        autoloaderInstance.get(__filename,'./fixtures/a.js',function(module){
            actual = module;
            
            test.ok(actual.indexOf(expected) !== -1, 'path should contain ' + expected);
            test.done();
        });
    }
};
