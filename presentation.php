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
      <div class="screenbox roundedscreen">
        <label>Intro</label>
        <video playsinline autoplay muted loop poster="img/bytryingital.jpg" id="slugfeeding">
            <source src="img/Pleurobranchaea-feeding-2.mp4" type="video/mp4">
        </video>
    </div>
      <div class="screenbox roundedscreen">
        <label>Background</label>
        <img src="img/pleuro-neuro-photo-overlay.png" id="slugface"></img>
      </div>
      <div class="screenbox roundedscreen">
        <label>Anatomy</label>
        <img src="img/tentacle-nerve.png" id="tentaclenerveinlay"></img>
      </div>
      <div class="screenbox roundedscreen">
        <label>Methods</label>
        <video playsinline autoplay muted loop poster="img/method-qtips.jpg" id="methodqtips">
            <source src="img/2pt-method-closeup-360p.mp4" type="video/mp4">
        </video>
      </div>
      <div class="screenbox roundedscreen">
        <label>Observations</label>
        <img src="img/yafremava-mean-normalized-nerve-response.gif" id="yafremavanerveresp"></img>
      </div>
      <div class="screenbox roundedscreen">
        <label>Model</label>
        <img src="img/modelsnap.png" id="modelsnap"></img>
      </div>
    </div>
    
    
    <div class="textholder roundedscreen nicescroll">
      <p>
        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.
      </p>
    </div>
    
    <article class="roundedscreen" data-neuromean-viz="">
    </article>
    
  </body>


  <script>
    document.getElementById('slugfeeding').playbackRate = 5;
  </script>  
</html>
    