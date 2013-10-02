var Booking = DS.Model.extend({

  companyName: DS.attr('string'),

  companyReg: DS.attr('string'),

  corporateMembership: DS.attr('boolean'),

  correspondenceAddress: DS.attr('string'),

  invoiceAddress: DS.attr('string'),

  tcAgreed: DS.attr('boolean'),

  showArea: DS.attr('string'),

  sameAs2013: DS.attr('boolean'),

  standType: DS.attr('string'),

  frontage: DS.attr('number'),

  depth: DS.attr('number'),

  position: DS.attr('string'),

  area: function() {
    return this.get('frontage') * this.get('depth');
  }.property('frontage', 'depth'),

  price: function() {
    var showArea = this.get('showArea');
    var standType = this.get('standType');
    var area = this.get('area');
    var price;
    switch(showArea){
      case "indoor":
        switch(standType){
            case "clear":
              if(area > 200) {price = 42*area}
                else {price = 45*area}
              break;
            case "modular":
              price = 100*area;
              break;
        }
        break
      case "outdoor":
        if(area <100) {price = 16*area}
        else if(area>=100 && area < 200) {price=15*area}
        else {price=14*area};
        break;
      case "machinery hall":
        if(area <100) {price = 18*area}
        else if(area>=100 && area < 200) {price=17*area}
        else {price=16*area};
        break;
      case "livestock hall":
        //some kind of redirect
        break;
    }
    return price;
  }.property('standType', 'showArea', 'area'),

  surcharge: function() {
    var position = this.get('position');
    switch(position) {
      case 'corner':
        return this.get('price')*0.1
        break;
      case 'peninsula':
        return this.get('price')*0.15
        break;
      case 'island':
        return this.get('price')*0.2
        break;
    }
  }.property('price', 'position'),

  depositPaid: DS.attr('boolean'),

  totalPaid: DS.attr('boolean'),

  breedSociety: DS.attr('string'),



});

module.exports = Booking;

