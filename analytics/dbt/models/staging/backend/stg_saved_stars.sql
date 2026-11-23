-- Every Star ever Saved; destroyed_at is set once Destroyed.
select
    seed as star_seed,
    owner_id as user_id,
    saved_at,
    destroyed_at
from {{ source('backend', 'saved_stars') }}
