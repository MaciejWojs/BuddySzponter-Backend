import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { zValidator } from 'src/shared/api/middleware/validator-wrapper';

import { loginBodySchema, registerBodySchema } from './auth.schema';
import {
  InternalServerErrorResponse,
  loginPayloadSchema,
  logoutPayloadSchema,
  mePayloadSchema,
  refreshPayloadSchema,
  registerPayloadSchema,
} from './schemas/auth.responses.schema';

const authRouter = new Hono();

authRouter.post('/register', zValidator('json', registerBodySchema), (c) => {
  // Example validated data access
  //const data = c.req.valid('json');

  // Here you would handle the logic for registering a new user, such as validating input and storing user data.

  const payload = {
    message: 'User registered successfully',
  };

  const result = registerPayloadSchema.safeParse(payload);

  if (!result.success) {
    const internalError: InternalServerErrorResponse = {
      success: false,
    };
    return c.json(internalError, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return c.json(payload);
});

authRouter.post('/login', zValidator('json', loginBodySchema), (c) => {
  const payload = {
    message: 'User logged in successfully',
  };

  const result = loginPayloadSchema.safeParse(payload);

  if (!result.success) {
    const internalError: InternalServerErrorResponse = {
      success: false,
    };
    return c.json(internalError, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  // Here you would handle the logic for logging in a user, such as validating credentials and generating a token.
  return c.json(payload);
});

authRouter.post('/refresh', (c) => {
  const payload = {
    message: 'Token refreshed successfully',
  };

  const result = refreshPayloadSchema.safeParse(payload);

  if (!result.success) {
    const internalError: InternalServerErrorResponse = {
      success: false,
    };
    return c.json(internalError, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  // Here you would handle the logic for refreshing a user's authentication token, such as validating the refresh token and generating a new access token.
  return c.json(payload);
});

authRouter.post('/logout', (c) => {
  const payload = {
    message: 'User logged out successfully',
  };

  const result = logoutPayloadSchema.safeParse(payload);

  if (!result.success) {
    const internalError: InternalServerErrorResponse = {
      success: false,
    };
    return c.json(internalError, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  // Here you would handle the logic for logging out a user, such as invalidating a token or clearing session data.
  return c.json(payload);
});

authRouter.get('/me', (c) => {
  const payload = {
    message: 'Authenticated user information retrieved successfully',
  };

  const result = mePayloadSchema.safeParse(payload);

  if (!result.success) {
    const internalError: InternalServerErrorResponse = {
      success: false,
    };
    return c.json(internalError, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  // Here you would handle the logic for retrieving the authenticated user's information, such as validating the token and querying user data.
  return c.json(payload);
});

export default authRouter;
