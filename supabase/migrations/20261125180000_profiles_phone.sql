-- Patient WhatsApp number (digits with country code, e.g. 5521999998888),
-- used to send the access link.
alter table public.profiles add column phone text;
