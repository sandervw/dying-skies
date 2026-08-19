select
    seed as star_seed,
    owner_id as user_id,
    saved_at
from {{ source('backend', 'saved_stars') }}
