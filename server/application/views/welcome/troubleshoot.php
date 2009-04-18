<h1>Troubleshooting Your Setup</h1>
<div class="no-ubiquity">
<h2>You have NO Ubiquity or NO MOBhat Commands</h2>
<p><strong style="color: red">Problem found</strong>: Do the following
<ol>
    <li><?php View::factory('common/ubiquity')->render(TRUE)?></li>
    <li><?php View::factory('common/mobhat_commands')->render(TRUE) ?></li>
    <li>Reload this page to continue troubleshooting</li>
    </p>
</div>
<div class="ubiquity" style="display: none">
    <p><strong style="color: green">OK</strong> Ubiquity and MOBhat Ubiquity commands Installed</p>
</div>