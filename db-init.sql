
-- Initialize Sacred Platform Database
-- Create test user for authentication

INSERT INTO users (username, email, password, created_at, updated_at) 
VALUES (
  'admin',
  'admin@sacred-platform.local',
  '$2a$10$rOzPqHs.E5vF8pVKfGmOmOWKGfKK0tJ4fZF4j3fGLGHQ0KfKGKFKe', -- password: 'sacred123'
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

INSERT INTO profiles (user_id, display_name, bio, created_at, updated_at)
SELECT 
  u.id,
  'Sacred Platform Administrator',
  'Platform administrator with full access to all sacred technologies and systems.',
  NOW(),
  NOW()
FROM users u 
WHERE u.email = 'admin@sacred-platform.local'
ON CONFLICT (user_id) DO NOTHING;
