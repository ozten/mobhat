
-- DELETE Their roles_users
DELETE FROM roles_users WHERE user_id = (SELECT users.id FROM users WHERE username = 'austin.ok');
-- DELETE Their user_tokens
DELETE FROM user_tokens WHERE user_id = (SELECT users.id FROM users WHERE username = 'austin.ok');
-- DELETE Their facets_urls
DELETE FROM facets_urls WHERE url_fk IN (
  SELECT urls.id FROM urls, users 
  WHERE urls.user_fk = users.id AND
        username = 'austin.ok'
);
-- DELETE Their urls
DELETE FROM urls WHERE user_fk = (SELECT users.id FROM users WHERE username = 'austin.ok');

-- DELETE Their FACETS_users
DELETE FROM facets_user WHERE user_id = (SELECT users.id FROM users WHERE username = 'austin.ok');

-- DETE FROM USERS
DELETE FROM users WHERE username = 'austin.ok';