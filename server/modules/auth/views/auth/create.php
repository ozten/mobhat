<?php defined('SYSPATH') OR die('No direct access allowed.'); ?>

<?php
echo form::open('auth_demo/save'); ?>
Email: <?php echo form::input('email'); ?><br />
Username: <?php echo form::input('username'); ?><br />
Password: <?php echo form::password('password'); ?><br />
<?php echo form::submit('submit', 'Create New User');
echo form::close() ?>