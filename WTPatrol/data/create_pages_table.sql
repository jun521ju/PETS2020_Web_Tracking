CREATE TABLE IF NOT EXISTS pages(
    id INTEGER PRIMARY KEY ASC,
    crawl_id INTEGER,
    visitedID INTEGER,
    url TEXT,
    finalUrl TEXT,
    isTimeout TEXT
);
