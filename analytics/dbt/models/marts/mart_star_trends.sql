-- Daily/weekly counts of saves, destroys, and signups over time.
-- Destroyed Skies keep their save; saves with no recorded time drop out.
with events as (
    select saved_at as event_at, 'saved' as event_type
    from {{ ref('stg_saved_stars') }}
    where saved_at is not null

    union all

    select destroyed_at as event_at, 'destroyed' as event_type
    from {{ ref('stg_saved_stars') }}
    where destroyed_at is not null

    union all

    select created_at as event_at, 'signup' as event_type
    from {{ ref('stg_users') }}
)

select
    date_trunc('day', event_at) as event_day,
    date_trunc('week', event_at) as event_week,
    event_type,
    count(*) as event_count
from events
group by 1, 2, 3
