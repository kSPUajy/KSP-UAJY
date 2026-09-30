-- Modules are released on Wednesday at 00.00 WIB, after the week's Monday
-- and Tuesday classes, so members study the module they were just taught.
-- `rilis` held each week's Monday (Tuesday for Array of Record, a single
-- Tuesday session). Move every one to that week's Wednesday. The week
-- itself still starts on the Monday, and the site now derives that from
-- `rilis`. Explicit deadlines (`tenggat`) are left as they are.

update public.modules
set rilis = rilis + (3 - extract(isodow from rilis))::integer
where extract(isodow from rilis) in (1, 2);
