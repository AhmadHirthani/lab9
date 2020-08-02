CREATE TABLE IF NOT EXISTS
movies (
  ciaty_name VARCHAR(255) NOT NULL,
  latitude VARCHAR(25) ,
  longitude VARCHAR(25) ,
  title VARCHAR(255) NOT NULL,
  overview VARCHAR(1000) NOT NULL,
  average_votes float8 NOT NULL,
  total_votes float8 NOT NULL,
  image_url VARCHAR(1000) NOT NULL,
  popularity float8 NOT NULL,
  released_on VARCHAR(255) NOT NULL
);


