var App = require('./app');

App.Router.map(function() {

  // generated by ember-generate --scaffold
  this.route('application', {path: '/'});
  this.route('index', {path: '/welcome'});
  this.resource('bookings', {path: '/bookings'});
  this.resource('booking', {path: '/bookings/:booking_id'});
  this.route('edit_booking', {path: '/bookings/:booking_id/edit'});
  this.route('new_booking', {path: '/bookings/new'});
  // end generated routes


});

App.ApplicationRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('index');
  }
});

