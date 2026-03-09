import { OpenAPIHono } from '@hono/zod-openapi';
import { defaultHook } from '@shared/api/openapi/defaultHook';
import { StatusCodes } from 'http-status-codes';

import {
  loginRoute,
  logoutRoute,
  meRoute,
  refreshRoute,
  registerRoute,
} from './auth.openapi';

const authRouter = new OpenAPIHono({ defaultHook });

authRouter.openapi(registerRoute, (c) => {
  // Example validated data access
  //const data = c.req.valid('json');

  // Here you would handle the logic for registering a new user, such as validating input and storing user data.

  const payload = {
    message: 'User registered successfully',
  };

  return c.json(payload, StatusCodes.OK);
});

authRouter.openapi(loginRoute, (c) => {
  const payload = {
    message: 'User logged in successfully',
  };

  // Here you would handle the logic for logging in a user, such as validating credentials and generating a token.
  return c.json(payload, StatusCodes.OK);
});

authRouter.openapi(refreshRoute, (c) => {
  const payload = {
    message: 'Token refreshed successfully',
  };

  // Here you would handle the logic for refreshing a user's authentication token, such as validating the refresh token and generating a new access token.
  return c.json(payload, StatusCodes.OK);
});

authRouter.openapi(logoutRoute, (c) => {
  const payload = {
    message: 'User logged out successfully',
  };

  // Here you would handle the logic for logging out a user, such as invalidating a token or clearing session data.
  return c.json(payload, StatusCodes.OK);
});

authRouter.openapi(meRoute, (c) => {
  const payload = {
    message: 'Authenticated user information retrieved successfully',
  };

  // Here you would handle the logic for retrieving the authenticated user's information, such as validating the token and querying user data.
  return c.json(payload, StatusCodes.OK);
});

export default authRouter;
