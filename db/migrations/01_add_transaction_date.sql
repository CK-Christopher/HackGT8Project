alter table invoice add column transaction_date datetime not null;
alter table invoice add column user_access_key char(16) not null;
