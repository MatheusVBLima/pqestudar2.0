-- Add admin role for pqestudar.suporte@gmail.com
insert into public.user_roles (user_id, role)
select id, 'admin'::app_role
from auth.users
where email = 'pqestudar.suporte@gmail.com'
on conflict (user_id, role) do nothing;