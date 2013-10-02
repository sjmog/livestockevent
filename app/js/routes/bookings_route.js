var Booking = require('../models/booking');

var BookingRoute = Ember.Route.extend({

  model: function() {
    return Booking.find();
  },
  renderTemplate: function() {
  	this.render('bookings')
  }

});

module.exports = BookingRoute;

