-- Destroyed stars: one row per destroyed seed, with owner and timestamp.
select
    seed as star_seed,
    owner_id as user_id,
    destroyed_at
from {{ source('backend', 'destroyed_stars') }}
