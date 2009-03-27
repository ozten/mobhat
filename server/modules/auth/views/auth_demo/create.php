<?php defined('SYSPATH') OR die('No direct access allowed.'); ?>
<style>
form{ margin: 10px auto; }
label{ width: 200px; display: block; float: left; clear: left; text-align: right;}
input{ float: left; }
</style>
<p>Create a user for MobHat. <strong>Make sure you use your FriendFeed username</strong> and any old or new password.
This system will match the username below against your FF account.</p>
<p>Your email address won't be shared and I won't do anything weird with it.</p>
<?php
echo form::open('auth_demo/save'); ?>
<label for="email">Email:</label> <?php echo form::input('email'); ?>
<label for="username">FriendFeed Username:</label> <?php echo form::input('username'); ?>
<label for="password">Password:</label> <?php echo form::password('password'); ?>
<br style="clear: both" />
<label for="submit">It's go time!</label> <?php echo form::submit('submit', 'Create New User');
echo form::close() ?>