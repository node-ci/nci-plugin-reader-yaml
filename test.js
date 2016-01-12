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
		var loader,
			revertFs,
			fsReadFileSpy = sinon.stub().callsArgWithAsync(2, null, 'yaml content'),
			revertYaml,
			yamlLoadSpy = sinon.stub().returns({json: true});

		before(function() {
			revertFs = plugin.__set__('fs', {readFile: fsReadFileSpy});
			revertYaml = plugin.__set__('yaml', {load: yamlLoadSpy});
		});

		it('should be done without errors', function(done) {
			loader = new constructor();
			loader._load('/tmp', 'test', function(err, json) {
				expect(err).not.ok();
				expect(json).eql({json: true});
				done();
			});
		});

		after(function() {
			revertFs();
			revertYaml();
		});
	});
});
