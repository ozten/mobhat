<?php defined('SYSPATH') OR die('No direct access allowed.'); ?>

<h3>Existing Users:</h3>
<?php
echo form::open('auth_demo/login'); ?>
Username: <?php echo form::input('username'); ?><br />
Password: <?php echo form::password('password'); ?><br />
<?php echo form::submit('submit', 'Login');
echo form::close() ?>
Not a User? <a href="create">Signup</a>