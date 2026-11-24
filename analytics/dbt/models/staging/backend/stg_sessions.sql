-- Sessions: one row per browser, never deleted; counter is its issuance count.
select
    counter
from {{ source('backend', 'sessions') }}
