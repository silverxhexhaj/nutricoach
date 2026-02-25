-- Seed sample library items for all existing coaches

insert into library_items (coach_id, type, title, content)
select c.id, v.type, v.title, v.content
from coaches c
cross join (
  values
    (
      'workout',
      'Full Body Workout',
      '{"exercises":[{"name":"Squats","sets":"3","reps":"10","rest":"60s"},{"name":"Push-ups","sets":"3","reps":"12","rest":"45s"},{"name":"Plank","sets":"3","reps":"30s","rest":"30s"}],"notes":"Warm up for 5 minutes first."}'::jsonb
    ),
    (
      'exercise',
      'Push-ups',
      '{"sets":"3","reps":"10-12","rest_seconds":"60","notes":"Keep core tight. Modify on knees if needed."}'::jsonb
    ),
    (
      'exercise',
      'Squats',
      '{"sets":"4","reps":"12","weight":"bodyweight","rest_seconds":"90","notes":"Focus on depth and knee tracking."}'::jsonb
    ),
    (
      'meal',
      'Grilled Chicken Salad',
      '{"foods":[{"name":"Grilled chicken breast","amount":"150","unit":"g","calories":"250","protein":"47"},{"name":"Mixed greens","amount":"100","unit":"g","calories":"20","protein":"2"},{"name":"Olive oil dressing","amount":"15","unit":"ml","calories":"120","protein":"0"}],"meal_type":"Lunch","notes":"Light olive oil dressing. Add veggies of choice."}'::jsonb
    ),
    (
      'meal',
      'Protein Oatmeal',
      '{"foods":[{"name":"Oats","amount":"50","unit":"g","calories":"190","protein":"7"},{"name":"Protein powder","amount":"30","unit":"g","calories":"120","protein":"24"},{"name":"Banana","amount":"1","unit":"medium","calories":"105","protein":"1"}],"meal_type":"Breakfast","notes":"Add water or milk. Top with berries optional."}'::jsonb
    ),
    (
      'video',
      'Form Check: Squat',
      '{"url":"https://www.youtube.com/watch?v=YaXPRqUwItQ","notes":"Watch for depth and knee tracking. Pause at key moments."}'::jsonb
    ),
    (
      'text',
      'Recovery Tips',
      '{"body":"Get 7-8 hours of sleep. Stay hydrated throughout the day. Stretch after workouts. Consider foam rolling for 5-10 minutes. Listen to your body and take rest days when needed."}'::jsonb
    )
) as v(type, title, content);
