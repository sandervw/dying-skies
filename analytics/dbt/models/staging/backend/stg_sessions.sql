-- Sessions: session identity and mutable issuance counter.
select
    session_id,
    counter,
    user_id
from {{ source('backend', 'sessions') }}
