define([
	"use!underscore",
	"./radio_select_filter",
	"./filter_form"
], 
function(_, RadioSelectFilterView, FilterFormView){

	views = {
		RadioSelectFilterView: RadioSelectFilterView,
		FilterFormView: FilterFormView
	};

	return views;

});
