var NewsView = Ember.View.extend({
	templateName: 'news',
	classNames: ['tile content-tile news list-tile mix exhibitor visitor general_info all tile-1-wide'],
	attributeBindings: ['width:data-width', 'height:data-height'],
	width: 1,
	height: 1
});

module.exports = NewsView;

