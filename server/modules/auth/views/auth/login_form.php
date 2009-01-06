<?php defined('SYSPATH') OR die('No direct access allowed.'); ?>

<?php
echo form::open('auth_demo/login'); ?>
Username: <?php echo form::input('username'); ?><br />
Password: <?php echo form::password('password'); ?><br />
<?php echo form::submit('submit', 'Login');
echo form::close() ?>