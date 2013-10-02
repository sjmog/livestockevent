var ContactView = Ember.View.extend({
	templateName: 'contact',
	classNames: ['tile content-tile tab-tile contact mix visitor exhibitor general_info all tile-1-wide'],
	attributeBindings: ['width:data-width', 'height:data-height'],
	width: 1,
	height: 1
});

module.exports = ContactView;

