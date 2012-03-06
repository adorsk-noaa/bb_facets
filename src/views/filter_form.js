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

						// Initialize a registry for form elements.
						this.element_registry = {};

						// Generate main form element from template.
						compiled_template = _.template(ff_template);
						$(this.el).html(compiled_template);

						// Generate form elements.
						_.each(this.model.get('form_elements'), function(element, name){
							rendered_element = this.render_element(element);

							// Register the rendered element.
							this.element_registry[element.id] = rendered_element;

							// Append it to the form.
							$(this.el).append(rendered_element.widget);

							// When the element's widget changes, update the corresponding filter value in the model.
							rendered_element.widget.bind('change', {view: this}, function(e){
								view = e.data.view;
								var filter_id = $(this).attr('id').match(/form-element-(.*)/)[1];
								filter_value = view.element_registry[filter_id].getValue();
								filter_values = view.model.get('filter_values');
								filter_values[filter_id] = filter_value;
								view.model.change();
								console.log(view.model.hasChanged());
							});
						}, this);

						// Bind filter value model change.
						this.model.on('change', this.foo);
						this.model.on('all', this.foo);
						this.model.change();
						this.on('all', this.foo);
					},

		foo: function(){
				 console.log('foo');
			 },
		
		render_element: function(element){
							var getValue;
							var widget_el = $('<div id="form-element-' + element.id + '" class="form-element-container"></div>');
							widget_el.append('<div class="element-name">' + element.label + '</div>');
							if (element.type == 'select'){

								// A specific select widget.
								if (element.widget == 'somewidget'){
								}

								// (Default) Radio select widget.
								else{
									
									// Create widget options.
									_.each(element.options, function(o){
										option_el = $('<div><input value="' + o[1] + '" name="' + element.id + '" type="radio"><label for="' + element.id + '">' + o[0] + '</label></div>');
										widget_el.append(option_el);
									});

									// Define getValue function.
									getValue = function(){
										return $('input:radio[name=' + element.id + ']:checked', widget_el).val();
									}
								}
							}

							var rendered_element = {
								"widget": widget_el,
								"getValue": getValue
							};

							return rendered_element;
						}
	});

	return FilterFormView;
});
		
