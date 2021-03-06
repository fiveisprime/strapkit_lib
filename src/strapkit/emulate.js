 /*
  Copyright 2014 EnSens, LLC D/B/A Strap
  Portions derived from original source created by Apache Software Foundation.
 
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

/*global require: true, module: true, process: true*/
/*jslint sloppy: true, white: true, newcap: true */

var strapkit_util      = require('./util'),
    path              = require('path'),
    hooker            = require('./hooker'),
    superspawn        = require('./superspawn'),
    Q                 = require('q');

// Returns a promise.
module.exports = function emulate(options) {
    var projectRoot = strapkit_util.cdProjectRoot();
    options = strapkit_util.preProcessOptions(options);

    var hooks = new hooker(projectRoot);
    return hooks.fire('before_emulate', options)
    .then(function() {
        // Run a prepare first!
        return require('./strapkit').raw.prepare(options.platforms);
    }).then(function() {
        // Deploy in parallel (output gets intermixed though...)
        return Q.all(options.platforms.map(function(platform) {
            var cmd = path.join(projectRoot, 'platforms', platform, 'strapkit', 'run');
            var args = ['--emulator'].concat(options.options);

            return superspawn.spawn(cmd, args, {stdio: 'inherit', printCommand: true});
        }));
    }).then(function() {
        return hooks.fire('after_emulate', options);
    });
};
