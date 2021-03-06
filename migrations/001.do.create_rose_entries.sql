/* create table to hold all journal entries. */
CREATE TABLE rose_entries (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    entry_date TIMESTAMPTZ DEFAULT now() NOT NULL,
    rose TEXT NOT NULL,
    thorn TEXT NOT NULL,
    bud TEXT NOT NULL,
    color TEXT NOT NULL
);
