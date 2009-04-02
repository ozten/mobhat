<?php
$pipe = fopen("php://stdin", "r");
      $thedata = "";
      while ($data = fgets($pipe)){
            //^[^[]*\[([^]]*)\] "GET /static/images/timing.gif\?s1=(\d*)&s..=(\d*)&s..=(\d*)&s..=(\d*)&s..=(\d*)&s..=(\d*) HTTP/.*$            
            echo preg_replace('/^[^[]*\\[([^]]*)\\] "GET \/static\/images\/timing.gif\\?s1=(\\d*)&s..=(\\d*)&s..=(\\d*)&s..=(\\d*)&s..=(\\d*)&s..=(\\d*) HTTP\/.*$/',
                              "\\1, \\2, \\3, \\4, \\5, \\6, \\7", $data);
            //$thedata = $thedata . $data . "EOL";
      }
?>