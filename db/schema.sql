create database if not exists hackgt;

use hackgt;

create table if not exists user (
  id char(32) primary key,
  pw_hash varchar(120) not null,
  email text not null,
  email_hash char(64) unique not null,
  name text not null
);

create table if not exists business (
  id char(32) primary key,
  foreign key (id) references user(id),
  location text
);

create table if not exists customer (
  id char(32) primary key,
  foreign key (id) references user(id)
);


create table if not exists shops_at (
  bus_id char(32) not null,
  cust_id char(32) not null,
  foreign key (bus_id) references business(id),
  foreign key (cust_id) references customer(id),
  primary key (bus_id, cust_id),
  points integer unsigned not null default 0
);

create table if not exists invoice (
  transaction_num bigint unsigned primary key,
  -- Should txnum be a text field? It supports more arbitrary data, but is worse for indexing
  bus_id char(32) not null,
  user_access_key char(16) not null,
  foreign key (bus_id) references business(id),
  transaction_date datetime not null,
  points integer unsigned not null
);

create table if not exists rewards (
  id integer unsigned primary key auto_increment,
  bus_id char(32) not null,
  foreign key (bus_id) references business(id),
  cost integer unsigned not null,
  name varchar(255) not null,
  description text not null
);

create table if not exists rewards_images (
  id integer unsigned primary key auto_increment,
  reward_id integer unsigned not null,
  bus_id char(32) not null,
  foreign key (reward_id) references rewards(id),
  foreign key (bus_id) references business(id),
  index (reward_id, bus_id),
  url text not null
);

create table if not exists user_faces (
  id integer unsigned primary key auto_increment,
  cust_id char(32) not null,
  foreign key (cust_id) references customer(id),
  index (cust_id),
  url text not null
);

create table if not exists csrf (
  id char(32) not null,
  token char(16) not null,
  foreign key (id) references user(id),
  primary key (token, id),
  endpoint varchar(255) not null,
  ip varchar(40) not null, -- supports v4 & v6 addresses
  expires datetime not null
);
