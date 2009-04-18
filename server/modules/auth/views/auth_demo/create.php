<?php defined('SYSPATH') OR die('No direct access allowed.'); ?>
<style>
form{ margin: 10px auto; }
label{ width: 200px; display: block; float: left; clear: left; text-align: right;}
input{ float: left; }
p{width: 600px; line-height: 1.5; font-family: "Helvetica"}
</style>
<p>Create a user for MobHat. <strong>Make sure you use your FriendFeed nickname</strong> and any new password.
This system will match the username below against your FF account.</p>

<p>Your email address won't be shared and I won't do anything weird with it.</p>
<h3>New MOBhat Account</h3>
<?php
echo form::open('auth_demo/save'); ?>
<label for="email">Email:</label> <?php echo form::input('email'); ?>
<label for="username"><strong>FriendFeed</strong> Nickname:</label> <?php echo form::input('username'); ?>
<label for="password"><strong>Not FriendFeed</strong> Password:</label> <?php echo form::password('password'); ?>
<br style="clear: both" />
<label for="submit">It's go time!</label> <?php echo form::submit('submit', 'Create New User');
echo form::close() ?>

<p style="clear: both">For this experiment, I'm basing everything on your FriendFeed username, but I don't need or want your FriendFeed password.
Play it safe and make up a MOBhat only password.</p>
<h3>What's my FriendFeed Nickname?</h3>
<div style="position: relative">
<iframe src="https://friendfeed.com/account" width="600" height="600"></iframe>
<img src="/static/ubiquity/where-nickname.png" style="position: absolute; top: 140px; left: 150px;" />
</div>