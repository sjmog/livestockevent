var booking = require('../models/booking');

var NewBookingRoute = Ember.Route.extend({

  renderTemplate: function() {
    this.render('edit_booking', {controller: 'new_booking'});
  },

  model: function() {
    return booking.createRecord();
  },

  deactivate: function() {
    var model = this.get('controller.model');
    if (!model.get('isSaving')) {
      model.deleteRecord();
    }
  }

});

module.exports = NewBookingRoute;

