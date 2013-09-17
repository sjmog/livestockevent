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
    <link rel="stylesheet" type="text/css" href="css/metro.css">
    <link href="css/style.min.css" rel="stylesheet">

    <script src="js/vendor/modernizr-2.6.2.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
  </head>
  <body>

    <!--start content-->
    <div class="row">
      <div class="small-12">
        <!-- Apply blue theme as default for all tiles, but use the tiles class to allow the theme to be swapped. The 'x-wide' property will change depending on the viewing media width (1 tile width has a total of 320px) -->
        <div id="tilePage" class="tiles rabdfblue tile-group three-wide page">
          <?php include 'partials/header/header.php'; ?>
          <?php include 'partials/tiles/testimonials/testimonials.php'; ?>
          <?php include 'partials/tiles/welcome/welcome.php'; ?>
          <?php include 'partials/tiles/getting_there/getting_there.php'; ?>
          <?php include 'partials/tiles/visitor_tickets/visitor_tickets.php'; ?>
          <?php include 'partials/tiles/exhibitor_stand_space/exhibitor_stand_space.php'; ?>
          <?php include 'partials/tiles/news/news.php'; ?>
          <?php include 'partials/tiles/social/social.php'; ?>
          <?php include 'partials/tiles/contact/contact.php'; ?>
          <?php include 'partials/tiles/about/about.php'; ?>
          <?php include 'partials/tiles/contractors/contractors.php'; ?>
          <?php include 'partials/footer/footer.php'; ?>
        </div>
      </div>
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
        $('#tilePage').mixitup();
      });
    </script>

  </body>
</html>
