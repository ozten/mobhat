DROP TABLE IF EXISTS facets;
CREATE TABLE facets ( 
  id INTEGER NOT NULL AUTO_INCREMENT, 
  description CHAR(20) NOT NULL, 
  created TIMESTAMP DEFAULT NOW(), 
  PRIMARY KEY (id), 
  CONSTRAINT description_index UNIQUE (description, id) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO facets (description) VALUES ('Everybody');

SELECT * FROM facets;

-- Start Kohana Auth Module SQL
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `name` varchar(32) NOT NULL,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `uniq_name` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

INSERT INTO `roles` (`id`, `name`, `description`) VALUES(1, 'login', 'Login privileges, granted after account confirmation');
INSERT INTO `roles` (`id`, `name`, `description`) VALUES(2, 'admin', 'Administrative user, has access to everything.');

CREATE TABLE IF NOT EXISTS `roles_users` (
  `user_id` int(10) unsigned NOT NULL,
  `role_id` int(10) unsigned NOT NULL,
  PRIMARY KEY  (`user_id`,`role_id`),
  KEY `fk_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `email` varchar(127) NOT NULL,
  `username` varchar(32) NOT NULL default '',
  `password` char(50) NOT NULL,
  `logins` int(10) unsigned NOT NULL default '0',
  `last_login` int(10) unsigned,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `uniq_username` (`username`),
  UNIQUE KEY `uniq_email` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `user_tokens` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `user_id` int(11) unsigned NOT NULL,
  `user_agent` varchar(40) NOT NULL,
  `token` varchar(32) NOT NULL,
  `created` int(10) unsigned NOT NULL,
  `expires` int(10) unsigned NOT NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `uniq_token` (`token`),
  KEY `fk_user_id` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

ALTER TABLE `roles_users`
  ADD CONSTRAINT `roles_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `roles_users_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

ALTER TABLE `user_tokens`
  ADD CONSTRAINT `user_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
--- End Kohana Auth Module SQL

CREATE TABLE facets_user (
        id INTEGER NOT NULL AUTO_INCREMENT,
        facet_id INTEGER NOT NULL,
        user_id INT(11) UNSIGNED NOT NULL,
        username VARCHAR(32) NOT NULL default '',

        PRIMARY KEY (id),
        CONSTRAINT facets_user_facet FOREIGN KEY (facet_id) REFERENCES facets (id),
        CONSTRAINT facets_user_user FOREIGN KEY (username) REFERENCES users (username)       
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--DROP TABLE urls;
CREATE TABLE urls (
    id INTEGER NOT NULL AUTO_INCREMENT,
    url VARCHAR(2048) NOT NULL,
    hash VARCHAR(32) NOT NULL,
    user_fk INT(10) UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT urls_user_fk FOREIGN KEY (user_fk) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE facets_urls (
    id INTEGER NOT NULL AUTO_INCREMENT,
    facet_fk INTEGER,
    url_fk INTEGER,
    PRIMARY KEY (id),
    CONSTRAINT facets_urls_facet_fk FOREIGN KEY (facet_fk) REFERENCES facets (id),
    CONSTRAINT facets_urls_url_fk FOREIGN KEY (url_fk) REFERENCES urls (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `kohana_session` (
  `session_id` varchar(40) NOT NULL,
  `last_activity` int(10) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  PRIMARY KEY (`session_id`)
)