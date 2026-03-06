import { Hono } from 'hono';
import { loginSchema, registerSchema } from './auth.schema';
import { zValidator } from 'src/shared/api/middleware/validator-wrapper';

const authRouter = new Hono();

authRouter.post('/register', zValidator('json', registerSchema), (c) => {
  const data = c.req.valid('json');
  console.log('Received registration data:', data);
  // Here you would handle the logic for registering a new user, such as validating input and storing user data.
  return c.json({ message: 'User registered successfully' });
});

authRouter.post('/login', zValidator('json', loginSchema), (c) => {
  const data = c.req.valid('json');
  console.log('Received login data:', data);
  // Here you would handle the logic for logging in a user, such as validating credentials and generating a token.
  return c.json({ message: 'User logged in successfully' });
});

authRouter.post('/refresh', (c) => {
  // Here you would handle the logic for refreshing a user's authentication token, such as validating the refresh token and generating a new access token.
  return c.json({ message: 'Token refreshed successfully' });
});

authRouter.post('/logout', (c) => {
  // Here you would handle the logic for logging out a user, such as invalidating a token or clearing session data.
  return c.json({ message: 'User logged out successfully' });
});

authRouter.get('/me', (c) => {
  // Here you would handle the logic for retrieving the authenticated user's information, such as validating the token and querying user data.
  return c.json({
    message: 'Authenticated user information retrieved successfully',
  });
});

export default authRouter;
