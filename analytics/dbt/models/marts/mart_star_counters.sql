-- Global star counter breakdown: saved, destroyed, dead.
with stars as (
    select
        count(*) filter (where destroyed_at is null) as saved_count,
        count(*) filter (where destroyed_at is not null) as destroyed_count
    from {{ ref('stg_saved_stars') }}
),
issued as (
    select coalesce(sum(counter), 0) as issued_count from {{ ref('stg_sessions') }}
)

select
    stars.saved_count as saved,
    stars.destroyed_count as destroyed,
    issued.issued_count - stars.saved_count - stars.destroyed_count as dead
from stars, issued
