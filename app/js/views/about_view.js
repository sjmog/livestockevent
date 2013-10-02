var AboutView = Ember.View.extend({
	templateName: 'about',
	classNames: ['tile content-tile about mix visitor exhibitor general_info all tile-1-wide'],
	attributeBindings: ['width:data-width', 'height:data-height'],
	width: 1,
	height: 1
});

module.exports = AboutView;

