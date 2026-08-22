-- Global star counter breakdown: saved, destroyed, dead.
with saved as (
    select count(*) as saved_count from {{ ref('stg_saved_stars') }}
),
destroyed as (
    select count(*) as destroyed_count from {{ ref('stg_destroyed_stars') }}
),
issued as (
    select sum(counter) as issued_count from {{ ref('stg_sessions') }}
)

select
    saved.saved_count as saved,
    destroyed.destroyed_count as destroyed,
    issued.issued_count - saved.saved_count - destroyed.destroyed_count as dead
from saved, destroyed, issued
