-- Read-only analytics_reader role, SELECT only, run manually on backend DB.
CREATE ROLE analytics_reader WITH LOGIN PASSWORD '__SET_SEPARATELY__';
GRANT CONNECT ON DATABASE dying_skies TO analytics_reader;
GRANT USAGE ON SCHEMA public TO analytics_reader;
GRANT SELECT ON sessions TO analytics_reader;
GRANT SELECT ON saved_stars TO analytics_reader;
-- Pending: grant users and a counters table once backend delivers them.
