define([
	"underscore",
	"./list_facet",
	"./numeric_facet",
	"./facet_collection",
	"./range_slider",
	"./time_slider_facet",
	"./facetsEditor"
], 
function(_, ListFacetView, NumericFacetView, FacetCollectionView, RangeSliderView, TimeSliderFacetView, FacetsEditorView){

	views = {
		ListFacetView: ListFacetView,
		NumericFacetView: NumericFacetView,
		FacetCollectionView: FacetCollectionView,
		RangeSliderView: RangeSliderView,
        TimeSliderFacetView: TimeSliderFacetView,
        FacetsEditorView: FacetsEditorView
	};

	return views;

});
