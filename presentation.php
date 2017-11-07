<?php
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate"); // HTTP/1.1
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache"); // HTTP/1.0
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
?><!DOCTYPE html>
<html data-ng-app="playgroundApp">
  <head>
    <?php include 'php/html_head_common.php'; ?>
    
    <script src="app/presentation/neuron.js"></script>
    <script src="app/presentation/presentation.js"></script>

    <link rel="stylesheet" type="text/css" href="style/presentation.css" />
    <title>Nerve Activity Proportional To Stimulus Position</title>
  </head>

  <body class="container">
    <video playsinline autoplay muted loop poster="golgicells.jpg" id="bgvid">
        <source src="img/12925532.mp4" type="video/mp4">
    </video>    
    
    
    <header>
      <h1>Nerve Activity Proportional To Stimulus Position</h1>
    </header>

    <article class="roundedscreen">
      asdfsd
    </article>

    <div class="sidebar">
      <div class="sidebox roundedscreen">
        <video playsinline autoplay muted loop poster="img/bytryingital.jpg" id="slugfeeding">
            <source src="img/Pleurobranchaea-feeding-2.mp4" type="video/mp4">
        </video>
    </div>
      <div class="sidebox roundedscreen">
        <img src="img/_DSC5325.jpg" id="slugface"></img>
      </div>
      <div class="sidebox roundedscreen">
        Slug diagram
      </div>
    </div>
    

  </body>
  
</html>
    