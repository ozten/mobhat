<?php
if (count($links) > 0 &&
    ! isset($links[0]->description)) { ?>
    <h2><?php echo $username ?>'s <?php echo $facet ?> Links</h2>
<div style="clear: both">
  <strong><a href="../../../../items/<?php echo $username ?>/0">All <?php echo $username ?>'s Urls</a></strong>
</div>  
<?php    
} else { ?>
  <h2><?php echo $username ?>'s Links</h2>
<?php
}
?>

<ul>
<?php
foreach($links as $link) { ?>
  <li style="clear: left"><div style="margin: auto; overflow: hidden; float: left; white-space: nowrap; font-family: monospace; font-size: 12px">(<?php echo $link->id ?>)
       <?php echo $link->hash ?></div><div style="float: left; margin-left: 5px;">
<?php   if (isset($link->description)) { ?>
       <strong><a href="../../faceted_items/<?php echo $username ?>/<?php echo $link->description ?>/page/0"><?php echo $link->description ?></a></strong>
<?php   } ?>
       
        <a href="<?php echo $link->url ?>"><?php echo $link->url ?></a></div></li>
<?php
}
?>
</ul>
<?php
if (count($links) > 0 &&
    ! isset($link->description)) { ?>
<div style="clear: both">
  <strong><a href="../../../../items/<?php echo $username ?>/page/0">All of <?php echo $username ?>'s Urls</a></strong>
</div>
<?php
}
?>