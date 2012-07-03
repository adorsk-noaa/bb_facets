define([
	"use!underscore",
	"./radio_select_facet",
	"./list_facet",
	"./numeric_facet",
	"./facet_collection",
	"./range_slider",
	"./time_slider_facet"
], 
function(_, RadioSelectFacetView, ListFacetView, NumericFacetView, FacetCollectionView, RangeSliderView, TimeSliderFacetView){

	views = {
		RadioSelectFacetView: RadioSelectFacetView,
		ListFacetView: ListFacetView,
		NumericFacetView: NumericFacetView,
		FacetCollectionView: FacetCollectionView,
		RangeSliderView: RangeSliderView,
        TimeSliderFacetView: TimeSliderFacetView
	};

	return views;

});
