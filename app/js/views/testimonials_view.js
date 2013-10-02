var TestimonialsView = Ember.View.extend({
	templateName: 'testimonials',
	classNames: ['tile testimonials mix exhibitor visitor all tile-1-wide'],
	attributeBindings: ['width:data-width', 'height:data-height'],
	width: 1,
	height: 1
});

module.exports = TestimonialsView;

