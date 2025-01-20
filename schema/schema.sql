CREATE TABLE user (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    bnet_account_id bigint not null UNIQUE
    battle_tag text NOT NULL,

)


CREATE TABLE bnet_tokens (
    user_id bigint references user,
    token varchar(64),
    created_at timestamp,
    expires_at timestamp

)