-- Total registered users.
select count(*) as total_users
from {{ ref('stg_users') }}
