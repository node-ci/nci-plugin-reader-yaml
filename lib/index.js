'use strict';

var Steppy = require('twostep').Steppy,
	inherits = require('util').inherits,
	fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml');


exports.register = function(app) {
	var ParentLoader = app.lib.BaseReaderLoader;

	function Loader() {
		ParentLoader.call(this);
	}

	inherits(Loader, ParentLoader);

	Loader.prototype.ext = 'yaml';

	Loader.prototype._load = function(dir, name, callback) {
		var self = this;
		Steppy(
			function() {
				var filePath = path.join(dir, name + '.' + self.ext);
				fs.readFile(filePath, 'utf8', this.slot());
			},
			function(err, text) {
				var content = yaml.load(text);

				this.pass(content);
			},
			callback
		);
	};

	app.reader.register(Loader.prototype.ext, Loader);
};
