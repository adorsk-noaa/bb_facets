define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"text!./templates/filter_form.html",
	"./radio_select_filter"
		],
function($, Backbone, _, template, RadioSelectFilterView){

	var FilterFormView = Backbone.View.extend({

		initialize: function(){
						this.renderForm();
						this.addAll();
					},

		renderForm: function(){
			form_html = _.template(template, {model: this.model.toJSON()});
			$(this.el).html(form_html);
			return this;
		},

		addOne: function(filter) {
		  var view = this.getViewForFilter(filter);
		  widget_el = view.render().el;
		  $(".filter-widgets", $(this.el)).append(widget_el);
		},	

		addAll: function() {
		  this.model.each(this.addOne, this);
		},

		getViewForFilter: function(filter){

			// Select filters.	
			if (filter.get('type') == 'select'){
				return new RadioSelectFilterView({
					model: filter
				});
			}
		},
		
	});

	return FilterFormView;
});
		
