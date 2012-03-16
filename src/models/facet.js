define([
	"use!backbone",
], 
function(Backbone){

var FacetModel = Backbone.Model.extend({

	defaults: {
		label: '',
		type: '',
		restrictions: {},
		parameters: {},
		serviceUrl: null
	},

	initialize: function(){
	},

	sync: function(method, model, options) {

		if (this.get('serviceUrl') != null){
			if (method == 'read'){
				options = options || {};
				options.url = this.get('serviceUrl') + '?PARAMS=' + JSON.stringify(this.get('parameters'));
			}
		}

		Backbone.sync(method, model, options);
	}

});

return FacetModel;

});

