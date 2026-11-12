-- Cortex30: multiple follow-up questions per exercise.
-- Run this once in the Supabase SQL editor (after 0001_init.sql). Safe to run more than once.

-- Appends one follow-up (question + coach reply) to a submission's feedback_json.followups,
-- up to max_count (hard-capped at 10). An older single `followup` is carried over as the first entry.
-- Returns the new number of follow-ups, or -1 if the limit is reached / the row isn't yours.
create or replace function public.add_followup_message(submission_id uuid, question text, reply text, max_count integer default 5)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  update public.submissions s
     set feedback_json = jsonb_set(
           s.feedback_json,
           '{followups}',
           coalesce(s.feedback_json -> 'followups',
                    case when s.feedback_json ? 'followup' then jsonb_build_array(s.feedback_json -> 'followup') else '[]'::jsonb end)
           || jsonb_build_array(jsonb_build_object('question', question, 'answer', reply, 'at', now())),
           true)
   where s.id = submission_id
     and s.user_id = auth.uid()
     and jsonb_array_length(coalesce(s.feedback_json -> 'followups',
                                     case when s.feedback_json ? 'followup' then jsonb_build_array(s.feedback_json -> 'followup') else '[]'::jsonb end))
         < least(greatest(max_count, 1), 10)
  returning jsonb_array_length(s.feedback_json -> 'followups') into n;
  return coalesce(n, -1);
end;
$$;

revoke all on function public.add_followup_message(uuid, text, text, integer) from public, anon;
grant execute on function public.add_followup_message(uuid, text, text, integer) to authenticated;
