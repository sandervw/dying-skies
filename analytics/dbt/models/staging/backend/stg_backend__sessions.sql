select
    session_id,
    counter,
    user_id
from {{ source('backend', 'sessions') }}
