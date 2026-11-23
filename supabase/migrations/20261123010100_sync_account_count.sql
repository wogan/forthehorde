alter table public.user_sync_state
    add column account_count integer check (account_count >= 0);
