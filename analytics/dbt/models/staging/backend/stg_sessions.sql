-- Sessions: one row per browser, never deleted; counter is its issuance count.
select
    session_id,
    counter
from {{ source('backend', 'sessions') }}
