-- アクセント練習：データベース定義（SPEC 8.2 / 8.3）
-- Supabase の SQL Editor に全部貼り付けて Run。何度実行しても大丈夫。

-- ===== テーブル =====
create table if not exists progress (
  user_id       text not null,
  item_id       text not null,
  status        text not null check (status in ('learning', 'mastered')),
  stage         int  not null default 0 check (stage between 0 and 4),
  due_date      date,
  correct_count int  not null default 0,
  wrong_count   int  not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table if not exists study_days (
  user_id  text not null,
  day      date not null,
  answered int  not null default 0,
  primary key (user_id, day)
);

create table if not exists reports (
  id         bigint generated always as identity primary key,
  user_id    text,
  item_id    text,
  created_at timestamptz default now()
);

-- ===== 直接アクセスは全面禁止（RLS 有効・ポリシーなし）=====
alter table progress   enable row level security;
alter table study_days enable row level security;
alter table reports    enable row level security;
revoke all on progress, study_days, reports from anon, authenticated;

-- ===== 共通：ユーザー ID の形式チェック（22 文字のランダム文字列）=====
create or replace function _check_user_id(p_user_id text) returns void
language plpgsql immutable as $$
begin
  if p_user_id is null or p_user_id !~ '^[A-Za-z0-9_-]{22}$' then
    raise exception 'invalid user id';
  end if;
end $$;

-- 「今日」= 日本時間、朝 4 時で日付が変わる
create or replace function _study_day() returns date
language sql stable as $$
  select ((now() at time zone 'Asia/Tokyo') - interval '4 hours')::date
$$;

-- ===== get_state：その人の全進捗 =====
create or replace function get_state(p_user_id text) returns json
language plpgsql security definer set search_path = public as $$
begin
  perform _check_user_id(p_user_id);
  return json_build_object(
    'progress', coalesce((
      select json_agg(json_build_object(
        'item_id', item_id, 'status', status, 'stage', stage, 'due_date', due_date,
        'correct_count', correct_count, 'wrong_count', wrong_count))
      from progress where user_id = p_user_id), '[]'::json),
    'study_days', coalesce((
      select json_agg(json_build_object('day', day, 'answered', answered) order by day)
      from study_days where user_id = p_user_id), '[]'::json)
  );
end $$;

-- ===== save_answer：1 詞条ぶんの結果を保存 + 今日の解答数 +1 =====
-- p_count_answer = false のときは解答数を数えない（仲間はずれ 1 問で 4 詞条を保存するときの 2 つ目以降）
-- 旧版（引数 6 つ）は消してから作り直す
drop function if exists save_answer(text, text, text, int, date, boolean);
create or replace function save_answer(
  p_user_id text, p_item_id text, p_status text, p_stage int, p_due_date date, p_correct boolean,
  p_count_answer boolean default true
) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform _check_user_id(p_user_id);
  if p_item_id is null or length(p_item_id) > 100 then
    raise exception 'invalid item id';
  end if;

  insert into progress (user_id, item_id, status, stage, due_date, correct_count, wrong_count, updated_at)
  values (p_user_id, p_item_id, p_status, p_stage, p_due_date,
          case when p_correct then 1 else 0 end, case when p_correct then 0 else 1 end, now())
  on conflict (user_id, item_id) do update set
    status        = excluded.status,
    stage         = excluded.stage,
    due_date      = excluded.due_date,
    correct_count = progress.correct_count + excluded.correct_count,
    wrong_count   = progress.wrong_count + excluded.wrong_count,
    updated_at    = now();

  if p_count_answer then
    insert into study_days (user_id, day, answered)
    values (p_user_id, _study_day(), 1)
    on conflict (user_id, day) do update set answered = study_days.answered + 1;
  end if;
end $$;

-- ===== report_item：「この問題を報告」=====
create or replace function report_item(p_user_id text, p_item_id text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform _check_user_id(p_user_id);
  insert into reports (user_id, item_id) values (p_user_id, left(p_item_id, 100));
end $$;

-- ===== 実行権限：この 3 つだけ anon に許可 =====
revoke all on function get_state(text) from public;
revoke all on function save_answer(text, text, text, int, date, boolean, boolean) from public;
revoke all on function report_item(text, text) from public;
revoke all on function _check_user_id(text) from public;
revoke all on function _study_day() from public;
grant execute on function get_state(text) to anon, authenticated;
grant execute on function save_answer(text, text, text, int, date, boolean, boolean) to anon, authenticated;
grant execute on function report_item(text, text) to anon, authenticated;
