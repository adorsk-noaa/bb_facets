define([
	// libs
	"jquery",
	"use!backbone",
	"use!underscore",

	// intramodule
	"text!filterform/templates/filter_form.html",
		],
function($, Backbone, _, ff_template){

	var FilterFormView = Backbone.View.extend({

		initialize: function(){
						// Generate main form element from template.
						compiled_template = _.template(ff_template);
						$(this.el).html(compiled_template);

						// Generate form elements.
						_.each(this.model.get('form_elements'), function(e, name){
							rendered_e = this.render_element(e);
							$(this.el).append(rendered_e.widget);
							// ADD REGISTRY HERE!
							rendered_e.widget.bind('change', function(ev){console.log(this);});
						}, this);
					},
		
		render_element: function(e){
							var getValue;
							var widget_el = $('<div class="form-element-container"></div>');
							widget_el.append('<div class="element-name">' + e.label + '</div>');
							if (e.type == 'select'){

								// A specific select widget.
								if (e.widget == 'somewidget'){
								}

								// (Default) Radio select widget.
								else{
									
									// Create widget options.
									_.each(e.options, function(o){
										option_el = $('<div><input value="' + o[1] + '" name="' + e.id + '" type="radio"><label for="' + e.id + '">' + o[0] + '</label></div>');
										widget_el.append(option_el);
									});

									// Define getValue function.
									getValue = function(){
										return $('input:radio[name=' + e.id + ']:checked', widget_el).val();
									}
								}
							}

							var rendered_e = {
								"widget": widget_el,
								"getValue": getValue
							};

							return rendered_e;
						}
	});

	return FilterFormView;
});
		
