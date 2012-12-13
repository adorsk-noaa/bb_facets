require(
  [
    "jquery",
    "rless!Facets/styles/facets.less",
    "rless!ui/css/smoothness/jquery-ui-1.9.1.custom.css",
    "Facets"
  ],
  function($, FacetsCSS, uiCSS, Facets){
    $(document).ready(function(){
      $(document.body).append('<p id="stylesLoaded" style="display: none;"></p>');
      cssEl = document.createElement('style');
      cssEl.id = 'rless';
      cssEl.type = 'text/css';
      cssText = uiCSS + FacetsCSS + "\n#stylesLoaded {position: fixed;}\n";
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
            min: 0,
            max: 1
          })
        });
        var v = new Facets.views.NumericFacetView({
          el: $('#main'),
          model: m
        });

        v.trigger('ready');
      });
    });
  }
);
