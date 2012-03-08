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
				  options: {},
				  restrictions_template: '<%= id %>=<% print(values.join(","));%>'
			  }),

	updateRestrictions: function(restrictions){
							// Update internal raw restrictions.
							_.extend(this._restrictions, restrictions);	

							// Update public formatted restrictions.
							this.set('restrictions', this.formatRestrictions(this._restrictions));
							//this.trigger('change change:restrictions');
						},

	formatRestrictions: function(restrictions){
		values = _.values(restrictions);
		formatted_restrictions = _.template(this.get('restrictions_template'), {id: this.id, values: values});	
		return formatted_restrictions;
	}

});

return SelectFilterModel;

});
