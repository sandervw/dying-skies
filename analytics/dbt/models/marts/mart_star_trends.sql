-- Daily/weekly counts of saves, destroys, and signups over time.
with events as (
    select saved_at as event_at, 'saved' as event_type
    from {{ ref('stg_saved_stars') }}

    union all

    select destroyed_at as event_at, 'destroyed' as event_type
    from {{ ref('stg_destroyed_stars') }}

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
