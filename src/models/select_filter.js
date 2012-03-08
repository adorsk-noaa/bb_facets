define([
	"use!underscore",
	"use!backbone",
	"./filter",
], 
function(_, Backbone, FilterModel){
var SelectFilterModel = FilterModel.extend({

	defaults: _.extend({}, FilterModel.prototype.defaults,
				{
				  type: 'select',
				  options: {}
			  }),

	updateRestrictions: function(restrictions){
							_.extend(this.get('restrictions'), restrictions);	
							this.trigger('change change:restrictions');
						}


});

return SelectFilterModel;

});
