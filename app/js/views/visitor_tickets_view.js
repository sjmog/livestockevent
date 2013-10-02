var VisitorTicketsView = Ember.View.extend({
	templateName: 'visitor_tickets',
	classNames: ['tile content-tile rabdfpink mix visitor_tickets visitor tile-1-wide tile-half-tall'],
	attributeBindings: ['width:data-width', 'height:data-height'],
	width: 1,
	height: 0.5
});

module.exports = VisitorTicketsView;

