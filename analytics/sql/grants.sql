-- Read-only analytics_reader role contract; backend ensure_analytics_role applies it.
CREATE ROLE analytics_reader WITH LOGIN PASSWORD '__SET_SEPARATELY__';
GRANT CONNECT ON DATABASE dying_skies TO analytics_reader;
GRANT USAGE ON SCHEMA public TO analytics_reader;
GRANT SELECT ON sessions TO analytics_reader;
GRANT SELECT ON saved_stars TO analytics_reader;
GRANT SELECT ON users TO analytics_reader;
GRANT SELECT ON destroyed_stars TO analytics_reader;
