// require other, dependencies here, ie:
// require('./vendor/moment');

require('../vendor/jquery');
require('../vendor/handlebars');
require('../vendor/ember');
require('../vendor/ember-data'); // delete if you don't want ember-data
require('../vendor/animo');
require('../vendor/fastclick');
require('../vendor/gridism');
require('../vendor/jquery.mixitup.min');
require('../vendor/jquery.placeholder.min');
require('../vendor/jquery.transit.min');
require('../vendor/Metrojs.min');
require('../vendor/pace.min');
require('../vendor/succinct');





var App = Ember.Application.create();
App.Store = require('./store'); // delete if you don't want ember-data

module.exports = App;

