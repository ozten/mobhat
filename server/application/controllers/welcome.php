<?php defined('SYSPATH') OR die('No direct access allowed.');
/**
 * Default Kohana controller. This controller should NOT be used in production.
 * It is for demonstration purposes only!
 *
 * @package    Core
 * @author     Kohana Team
 * @copyright  (c) 2007-2008 Kohana Team
 * @license    http://kohanaphp.com/license.html
 */
class Welcome_Controller extends Template_Controller {
	const ALLOW_PRODUCTION = TRUE;

	// Most of this site is not visual, not much template action
	public $template = 'oface/template';

	public function index()
	{
		$this->template->content = new View('welcome_content');
		$this->template->title = 'MOBhat an experiment in faceting and grouping your Lifestreaming Entries';		
	}
}