var ContractorsView = Ember.View.extend({
	templateName: 'contractors',
	classNames: ['tile content-tile tab-tile contractors content-tile mix exhibitor general_info tile-1-wide'],
	attributeBindings: ['width:data-width', 'height:data-height'],
	width: 1,
	height: 1
});

module.exports = ContractorsView;

