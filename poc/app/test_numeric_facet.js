require(
  [
    "jquery",
    "rless!Facets/styles/facets.less",
    "rless!ui/css/smoothness/jquery-ui-1.9.1.custom.css",
    "rless!tabble/jquery.ui.tabble.less",
    "Facets"
  ],
  function($, FacetsCSS, uiCSS, tabbleCSS, Facets){
    $(document).ready(function(){
      $(document.body).append('<p id="stylesLoaded" style="display: none;"></p>');
      cssEl = document.createElement('style');
      cssEl.id = 'rless';
      cssEl.type = 'text/css';
      cssText = uiCSS + tabbleCSS + FacetsCSS + "\n#stylesLoaded {position: fixed;}\n";
      if (cssEl.styleSheet){
        cssEl.styleSheet.cssText = cssText;
      }
      else{
        cssEl.appendChild(document.createTextNode(cssText));
      }
      document.getElementsByTagName("head")[0].appendChild(cssEl);

      var cssDeferred = $.Deferred();
      var cssInterval = setInterval(function(){
        $testEl = $('#stylesLoaded');
        var pos = $testEl.css('position');
        if (pos == 'fixed'){
          clearInterval(cssInterval);
          cssDeferred.resolve();
        }
        else{
          console.log('loading styles...', pos);
        }
      }, 500);

      cssDeferred.done(function(){
        var m = new Backbone.Model({
          selection: new Backbone.Model({
            min: 0,
            max: 1
          }),
          range: new Backbone.Model({
            xmin: 0,
            xmax: 1,
            ymin: -1,
            ymax: 1
          })
        });
        var v = new Facets.views.NumericFacetView({
          el: $('#main'),
          model: m
        });

        function generateHistograms(){
          var xmin = parseFloat($('#xmin').val(), 10);
          var xmax = parseFloat($('#xmax').val(), 10);
          var ymin = parseFloat($('#ymin').val(), 10);
          var ymax = parseFloat($('#ymax').val(), 10);
          var nBins = 10;
          var xrange = xmax - xmin;
          var yrange = ymax - ymin;
          var xBinWidth = xrange/nBins;
          var yBinWidth = yrange/nBins;

          var baseHistogram = [];
          for (var i = 0; i < nBins; i++){
            baseHistogram.push({
              min: xmin + i * xBinWidth,
              max: xmin + (i+1) * xBinWidth,
              count: ymin + i * yBinWidth
            });
          }
          var filteredHistogram = [];
          $.each(baseHistogram, function(i, bin){
            var baseBin = baseHistogram[i];
            filteredHistogram.push({
              min: baseBin.min,
              max: baseBin.max,
              count: baseBin.count * .75
            });
          });

          m.set({
            base_histogram: baseHistogram,
            filtered_histogram: filteredHistogram,
          });
        };

        $('#generate').on('click', function(){
          generateHistograms();
        });

        v.trigger('ready');
      });
    });
  }
);
