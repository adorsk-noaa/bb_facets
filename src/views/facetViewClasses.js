define([
	"./list_facet",
    "./numeric_facet",
    "./time_slider_facet"
    ],
function(ListFacetView, NumericFacetView, TimeSliderFacetView){
    return {
        list: ListFacetView,
        numeric: NumericFacetView,
        timeSlider: TimeSliderFacetView
    };
});
