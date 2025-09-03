-- Create a function to get user's rank based on XP
CREATE OR REPLACE FUNCTION get_user_rank(user_id UUID)
RETURNS BIGINT AS $$
DECLARE
  user_rank BIGINT;
BEGIN
  SELECT rank INTO user_rank
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY xp DESC) as rank
    FROM profiles
    WHERE xp > 0
  ) ranked_users
  WHERE id = user_id;
  
  RETURN user_rank;
END;
$$ LANGUAGE plpgsql;
