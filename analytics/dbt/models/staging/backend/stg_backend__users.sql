-- Users, excluding password_hash. Never expose credential hashes downstream.
select
    id as user_id,
    username,
    created_at
from {{ source('backend', 'users') }}
