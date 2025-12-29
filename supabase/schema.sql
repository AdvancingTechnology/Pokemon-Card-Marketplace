// ... existing code ...
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends the default auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS) for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Portfolio table
create table portfolio_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  card_id text not null, -- API id for the card
  name text not null,
  set_name text,
  image_url text,
  quantity integer default 1,
  purchase_price decimal(10, 2),
  purchase_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table portfolio_items enable row level security;

create policy "Users can view their own portfolio."
  on portfolio_items for select
  using ( auth.uid() = user_id );

create policy "Users can insert into their own portfolio."
  on portfolio_items for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own portfolio."
  on portfolio_items for update
  using ( auth.uid() = user_id );

create policy "Users can delete from their own portfolio."
  on portfolio_items for delete
  using ( auth.uid() = user_id );

-- Price Alerts table
create table price_alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  card_id text not null,
  card_name text not null,
  target_price decimal(10, 2) not null,
  condition text check (condition in ('above', 'below')) not null,
  is_active boolean default true,
  last_triggered_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table price_alerts enable row level security;

create policy "Users can view their own alerts."
  on price_alerts for select
  using ( auth.uid() = user_id );

create policy "Users can manage their own alerts."
  on price_alerts for all
  using ( auth.uid() = user_id );

-- Watchlist table
create table watchlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  card_id text not null,
  card_name text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, card_id)
);

alter table watchlist enable row level security;

create policy "Users can view their own watchlist."
  on watchlist for select
  using ( auth.uid() = user_id );

create policy "Users can manage their own watchlist."
  on watchlist for all
  using ( auth.uid() = user_id );

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Trigger to automatically create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
