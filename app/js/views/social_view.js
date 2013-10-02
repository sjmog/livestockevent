var SocialView = Ember.View.extend({
	templateName: 'social',
	classNames: ['tile social content-tile list-tile mix exhibitor visitor general_info all tile-1-wide tab-tile'],
	attributeBindings: ['width:data-width', 'height:data-height'],
	width: 1,
	height: 1
});

module.exports = SocialView;

