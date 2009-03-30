<?php defined('SYSPATH') OR die('No direct access allowed.'); ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<link rel="stylesheet" type="text/css" href="/static/css/stylo.css" media="all" />
	<link rel="icon" href="/static/images/favicon.gif" type="image/gif">
	<script src="/static/js/lib/jquery-1.2.6.js"></script>
	<script src="/static/js/lib/json2.js"></script>	
	<!-- script src="http://www.google.com/jsapi"></script >
	<script>
	// Load jQuery
	google.load("jquery", "1");
	</script-->

	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<title><?php echo html::specialchars($title) ?></title>

	<style type="text/css">
.current{
	font-weight: 900;
}
.weight6{font-size: 2em;}
.weight5{font-size: 1.60em;}
.weight4{font-size: 1.3em;}
.weight3{font-size: 1.15em;}
.weight2{font-size: 1.0em;}
.weight1{font-size: 0.9em;}
.mob {
	font-family: "Lithos Pro", "Futura", sans-serif;
	font-weight: 900;
}
* {
	font-family: "Helvetica", "Arial", sans-serif;
}
	</style>

</head>
<body>
	<?php echo $content ?>

	<!-- p class="copyright">
		Rendered in {execution_time} seconds, using {memory_usage} of memory<br />
	</p -->

</body>
</html>