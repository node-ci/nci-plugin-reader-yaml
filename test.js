'use strict';

var expect = require('expect.js'),
	sinon = require('sinon'),
	rewire = require('rewire'),
	plugin = rewire('./lib');

describe('Plugin', function() {
	function BaseReaderLoader() {
	}

	var registerSpy = sinon.stub(),
		app = {
			lib: {BaseReaderLoader: BaseReaderLoader},
			reader: {register: registerSpy}
		};

	var constructor;

	describe('register', function() {
		it('without errors', function() {
			plugin.register(app);
		});

		it('called once', function() {
			expect(registerSpy.calledOnce).equal(true);
		});

		it('with ext', function() {
			expect(registerSpy.getCall(0).args[0]).eql('yaml');
		});

		it('with constructor', function() {
			constructor = registerSpy.getCall(0).args[1];
			expect(constructor).a('function');
			expect(constructor.prototype).a(app.lib.BaseReaderLoader);
			expect(constructor.prototype._load).a('function');
		});
	});

	describe('load', function() {
		var makeSpies = function(params) {
			return {
				fsReadFile: sinon.stub().callsArgWithAsync(
					2, params.readFileError || null, params.yamlText
				),
				yamlLoadSpy: (
					params.loadedJson ? sinon.stub().returns(params.loadedJson) :
						sinon.stub().throws()
				)
			};
		};

		var setSpies = function(spies) {
			return plugin.__set__({
				fs: {readFile: spies.fsReadFile},
				yaml: {load: spies.yamlLoadSpy}
			});
		};

		var loader, spies, revertSpies;

		before(function() {
			spies = makeSpies({
				yamlText: 'yaml text',
				loadedJson: {json: true}
			});
			revertSpies = setSpies(spies);
		});

		it('should be done without errors', function(done) {
			loader = new constructor();
			loader._load('/tmp', 'test', function(err, json) {
				expect(err).not.ok();
				expect(json).eql({json: true});
				done();
			});
		});

		it('read file should be called with proper args', function() {
			expect(spies.fsReadFile.calledOnce).equal(true);
			expect(spies.fsReadFile.getCall(0).args[0]).equal('/tmp/test.yaml');
		});

		after(function() {
			revertSpies();
		});
	});
});
