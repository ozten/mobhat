<?php defined('SYSPATH') OR die('No direct access allowed.'); ?>
<h2>Facet Switcher:</h2>
		<div class="box">
				<p>This is the Oface demo page. You may also access this page as <code><?php echo html::anchor('welcome/index', 'welcome/index') ?></code>.</p>

				<p>This demo assumes you are the user pattyo. Here is pattyo's switcher:</p>

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
						<label for="switchinput">Add A New Facet:</label> <input id="switchinput" value="" />
						<button id="all-facets-close">Close</button>
						</div>				        
				</div>
		
				<div id="facet-reader">
						<form action="http://oface.ubuntu/resources/query_facets"
							  method="post">
								<label for="url"></label>
								<input id="url" name="url" type="text" />
								<input type="submit" />
						</form>
				</div>
		</div>
<script src="/static/js/demo.js" type="text/javascript"></script>
<h2>Other APIs</h2>
<h3>WhoAmI</h3>
<p><a href="/users/whoami">/users/whoami</a> - Detects a logged in user and returns a UserInfo resource.
If the user isn't logged in, then they will be asked to authenticate.</p>