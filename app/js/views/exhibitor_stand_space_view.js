var ExhibitorStandSpaceView = Ember.View.extend({
	templateName: 'exhibitor_stand_space',
	classNames: ['tile content-tile rabdforange mix exhibitor exhibitor_stand_space tile-1-wide tile-half-tall'],
	attributeBindings: ['width:data-width', 'height:data-height'],
	width: 1,
	height: 0.5
});

module.exports = ExhibitorStandSpaceView;

