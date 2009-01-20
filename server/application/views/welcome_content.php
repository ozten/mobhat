<?php defined('SYSPATH') OR die('No direct access allowed.'); ?>
		<div class="box">
				<p>This is the Oface demo page. You may also access this page as <code><?php echo html::anchor('welcome/index', 'welcome/index') ?></code>.</p>

				<p>This demo assumes you are the user ozten. Here is ozten's switcher:</p>

				<div id="switcher">
						<div id="current-facets">
								<h4>Current Facets</h4>
								<ul id="switcher-current-facets">
										<li class=""></li>
								</ul>
						</div>
						<div id="all-facets" style="display: none">
								<h4>All Facets</h4>

								<ul id='switcher-facetlist'>
										<li id="template"><span class="facetitem"></span> <a href="#" class="remove-facet-a">x</a></li>
								</ul>
						<input id="switchinput" value="" />
						</div>				        
				</div>
		</div>
<script src="/static/js/demo.js" type="text/javascript"></script>