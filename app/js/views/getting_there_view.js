var GettingThereView = Ember.View.extend({
	templateName: 'getting_there',
	classNames: ['tile content-tile getting_there mix exhibitor visitor general_info tab-tile all tile-1-wide'],
	attributeBindings: ['width:data-width', 'height:data-height'],
	width: 1,
	height: 1
});

module.exports = GettingThereView;

