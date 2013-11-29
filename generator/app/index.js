var util = require('util')
var path = require('path')
var yeoman = require('yeoman-generator')

var SkellyGenerator = module.exports = function SkellyGenerator(args, options, config) {
	yeoman.generators.Base.apply(this, arguments)

	this.options.js = options.js

	this.on('end', function () {
		if(!options['skip-install']) {
			this.npmInstall()
		}
	})

	this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')))
}

util.inherits(SkellyGenerator, yeoman.generators.Base)

SkellyGenerator.prototype._getJSFile = function _getJSFile(file) {
	return file + (this.options.js ? '.js' : '.ls')
}

SkellyGenerator.prototype.askFor = function askFor() {
	// var cb = this.async()

	console.log(this.yeoman)

	// var prompts = [{
	// 	type: 'confirm',
	// 	name: 'someOption',
	// 	message: 'Would you like to enable this option?',
	// 	default: true
	// }]

	// this.prompt(prompts, function (props) {
	// 	this.someOption = props.someOption

	// 	cb()
	// }.bind(this))
}

SkellyGenerator.prototype.app = function app() {
	this.mkdir('public')
	this.copy('package.json', 'package.json')
	this.copy('index.html', 'public/index.html')
	this.copy(this._getJSFile('server'), this._getJSFile('server'))
	this.copy(this._getJSFile('client'), this._getJSFile('client'))
}

SkellyGenerator.prototype.projectfiles = function projectfiles() {

}