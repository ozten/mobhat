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