<!doctype html>
<html class="no-js">
  <head>
    <meta charset="utf-8">
    <title>Livestock Event 2014</title>

    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width,initial-scale=1">

    <link href="//www.google-analytics.com" rel="dns-prefetch">
    <link href="//ajax.googleapis.com" rel="dns-prefetch">
    <link href="css/animate+animo.css" rel="stylesheet" type="text/css">
    <link href="css/adminjs.css" rel="stylesheet">
    <link href="css/style.min.css" rel="stylesheet">


    <script src="js/vendor/modernizr-2.6.2.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <!--and jQuery 2. This is getting big...-->
    <script src="http://code.jquery.com/jquery-2.0.3.min.js" type="text/javascript"></script>
    <script src="js/vendor/animo.js" type="text/javascript"></script>
    <script src="js/vendor/pace.min.js"></script>
    <script src="js/vendor/handlebars.js"></script>
    <script src="js/vendor/ember.js"></script>
    <script src="js/vendor/epf.js"></script>
    <script src="js/vendor/adminjs.js"></script>
    <script>
    App = AJS.Application.create();

    App.User = Ep.Model.extend({
      name: Ep.attr('string'),
      company: Ep.attr('string'),
      progress: Ep.attr('number'),
      applications: Ep.hasMany(App.Application)
    });

    App.configure(function() {
      this.manage('user');
    });
        </script>
  </head>
  <body>

    <!--start content-->
    <div class="container">
         
    </div>

    <script>window.jQuery || document.write('<script src="js/vendor/jquery-1.10.2.min.js"><\/script>');</script>
    <script src="js/scripts.min.js"></script>
    <script src="js/vendor/jquery.mixitup.min.js"></script>

    <script>
    (function(f,i,r,e,s,h,l){i['GoogleAnalyticsObject']=s;f[s]=f[s]||function(){
    (f[s].q=f[s].q||[]).push(arguments)},f[s].l=1*new Date();h=i.createElement(r),
    l=i.getElementsByTagName(r)[0];h.async=1;h.src=e;l.parentNode.insertBefore(h,l)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-XXXXXXXX-XX');
    ga('send', 'pageview');
    </script>

    <!--scripts-->

    <script src="js/foundation/foundation.js"></script>

    <script src="js/foundation/foundation.abide.js"></script>

    <script src="js/foundation/foundation.alerts.js"></script>

    <script src="js/foundation/foundation.clearing.js"></script>

    <script src="js/foundation/foundation.cookie.js"></script>

    <script src="js/foundation/foundation.dropdown.js"></script>

    <script src="js/foundation/foundation.forms.js"></script>

    <script src="js/foundation/foundation.interchange.js"></script>

    <script src="js/foundation/foundation.joyride.js"></script>

    <script src="js/foundation/foundation.magellan.js"></script>

    <script src="js/foundation/foundation.orbit.js"></script>

    <script src="js/foundation/foundation.placeholder.js"></script>

    <script src="js/foundation/foundation.reveal.js"></script>

    <script src="js/foundation/foundation.section.js"></script>

    <script src="js/foundation/foundation.tooltips.js"></script>

    <script src="js/foundation/foundation.topbar.js"></script>

    <script src="js/vendor/gridism.js"></script>

    <script>
    $(document).foundation();
    </script>
    <script src="js/vendor/MetroJs.min.js" type="text/javascript"></script>
    <script type="text/javascript">
        $(document).ready(function(){
            $(".live-tile").not('.staticTile').liveTile();
        });
    </script>
    <!--filters-->
    <script type="text/javascript">
      $(function() {
        $('.container').mixitup({
          onMixEnd: function() {
            gridify()}
        });
      });
    </script>

    <!--maintaining the grid-->
    <script type="text/javascript">
      $(function() {        
        gridify();
      });
    </script>

  </body>
</html>
