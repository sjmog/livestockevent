var FooterView = Ember.View.extend({
	templateName: 'footer',
	classNames: ['tile footer tile-quarter-tall tile-n-wide rabdflightgray'],
	attributeBindings: ['width:data-width', 'height:data-height'],
	width: 'n',
	height: 1
});

module.exports = FooterView;

