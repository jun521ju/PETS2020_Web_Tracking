/* TODO: link with requests */
CREATE TABLE IF NOT EXISTS http_responses(
  id INTEGER PRIMARY KEY ASC,
  crawl_id INTEGER,
  visit_id INTEGER,
  url TEXT,
  method TEXT,
  referrer TEXT,
  response_status INTEGER,
  response_status_text TEXT,
  is_cached BOOLEAN,
  headers TEXT,
  location TEXT,
  time_stamp TEXT,
  content_hash TEXT
);
