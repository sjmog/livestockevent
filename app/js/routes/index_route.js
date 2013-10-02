var IndexRoute = Ember.Route.extend({
	setupController: function(controller) {
	    controller.set('model', []);
	  }
});

module.exports = IndexRoute;

