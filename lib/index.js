'use strict';

var Steppy = require('twostep').Steppy,
	inherits = require('util').inherits,
	fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml');


exports.register = function(app) {
	var ParentReader = app.lib.reader.BaseReader;

	function Reader() {
		ParentReader.call(this);
	}

	inherits(Reader, ParentReader);

	Reader.prototype.ext = 'yaml';

	Reader.prototype._load = function(dir, name, callback) {
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

	app.lib.reader.register(Reader.prototype.ext, Reader);
};
