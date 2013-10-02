var WelcomeView = Ember.View.extend({
	templateName: 'welcome',
	classNames: ['tile welcome tab-tile content-tile mix exhibitor visitor general_info all tile-2-wide'],
	attributeBindings: ['width:data-width', 'height:data-height'],
	width: 2,
	height: 1
});

module.exports = WelcomeView;

