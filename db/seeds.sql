DROP TABLE IF EXISTS todos;

CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT 0
);

INSERT INTO todos (title, done)
VALUES ('Buy milk', 0);

INSERT INTO todos (title, done)
VALUES ('Buy eggs', 0);

INSERT INTO todos (title, done)
VALUES ('Buy bread', 0);

INSERT INTO todos (title, done)
VALUES ('Buy butter', 0);

INSERT INTO todos (title, done)
VALUES ('Buy jam', 0);
