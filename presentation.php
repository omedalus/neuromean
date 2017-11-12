<?php
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate"); // HTTP/1.1
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache"); // HTTP/1.0
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
?><!DOCTYPE html>
<html data-ng-app="presentationApp">
  <head>
    <?php include 'php/html_head_common.php'; ?>
    
    <script src="app/presentation/presentation.js"></script>
    <script src="app/presentation/neuromean-viz.js"></script>
    <script src="app/presentation/selbox.js"></script>
    <script src="app/presentation/thumbclick.js"></script>

    <link rel="stylesheet" type="text/css" href="style/presentation.css" />
    <link rel="stylesheet" type="text/css" href="style/neuromean-viz.css" />
    <link rel="stylesheet" type="text/css" href="style/slider.css" />
    <link rel="stylesheet" type="text/css" href="style/scrollbar.css" />
    
    <title>Modeling odor tracking computations in the peripheral nervous system of a predatory snail</title>
  </head>

  <body class="container-fluid noselect">
    <video playsinline autoplay muted loop poster="img/red-golgi-background.png" id="bgvid">
        <source src="img/bgvid/shutterstock_v2406011.mov" type="video/mp4">
    </video>    
    
    
    <header>
      <h1>Modeling odor tracking computations in the peripheral nervous system of a predatory snail</h1>
      <p>
        Mikhail Voloshin, Martha Gillette, Rhanor Gillette
      </p>
    </header>

    <div class="screenboxes">
      <div class="screenbox roundedscreen"
          data-selbox="Intro"
          data-selbox-target="'#thetextholder'"
          data-selbox-source="'partials/intro.html'"
          data-selbox-auto="true">
        <label>Intro</label>
        <video playsinline autoplay muted loop poster="img/bytryingital.jpg" id="slugfeeding">
            <source src="img/Pleurobranchaea-feeding-2.mp4" type="video/mp4">
        </video>
      </div>
      <div class="screenbox roundedscreen" 
          data-selbox="Anatomy"
          data-selbox-target="'#thetextholder'"
          data-selbox-source="'partials/anatomy.html'">
        <label>Anatomy</label>
        <img src="img/pleuro-neuro-photo-overlay.png" id="slugface"></img>
      </div>
      <div class="screenbox roundedscreen" 
          data-selbox="Behavior"
          data-selbox-target="'#thetextholder'"
          data-selbox-source="'partials/behavior.html'">
        <label>Behavior</label>
        <video playsinline autoplay muted loop poster="img/method-qtips.png" id="methodqtips">
            <source src="img/2pt-method-closeup-360p.mp4" type="video/mp4">
        </video>
      </div>
      <div class="screenbox roundedscreen" 
          data-selbox="Model"
          data-selbox-target="'#thetextholder'"
          data-selbox-source="'partials/model.html'">
        <label>Model</label>
        <img src="img/coding-ide.gif" id="modelsnap"></img>
      </div>
      <div class="screenbox roundedscreen" 
          data-selbox="Visualization"
          data-selbox-target="'#thetextholder'"
          data-selbox-source="'partials/visualization.html'">
        <label>Visualization</label>
        <img src="img/modelsnap.png" id="modelsnap"></img>
      </div>
    </div>
    

    <div class="textholder roundedscreen" id="thetextholder">
    </div>

    
    <article class="roundedscreen" data-neuromean-viz="">
    </article>

    
  </body>


  <script>
    document.getElementById('slugfeeding').playbackRate = 5;
  </script>  
</html>
    