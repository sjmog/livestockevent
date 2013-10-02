var ImageView = Ember.View.extend({
	templateName: 'image',
	classNames: ['tile image-tile mix general_info all tile-1-wide'],
	attributeBindings: ['width:data-width', 'height:data-height'],
	width: 1,
	height: 1
});

module.exports = ImageView;

