import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

import { DaoFactory } from '@/infrastucture/factories/daoFactory';
import { defaultHook } from '@/shared/api/openapi/defaultHook';
import { ENV } from '@/shared/types/honoENV';

import { CreateRole } from '../application/use-case/createRole';
import { DeleteRole } from '../application/use-case/deleteRole';
import { GetRoles } from '../application/use-case/getRoles';
import { UpdateRole } from '../application/use-case/updateRole';
import {
  createRoleRoute,
  deleteRoleRoute,
  getRolesRoute,
  updateRoleRoute
} from './roles.openapi';

const administrationRolesRouter = new OpenAPIHono<ENV>({ defaultHook });

const parsePositiveIntegerParam = (
  value: unknown,
  field = 'roleID'
): number => {
  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
      message: 'ValidationError',
      cause: [{ field, error: 'Must be a positive integer' }]
    });
  }

  return parsed;
};

administrationRolesRouter.openapi(getRolesRoute, async (c) => {
  const roleDao = new DaoFactory().db.roleDao();
  const useCase = new GetRoles(roleDao);
  const roles = await useCase.execute();

  return c.json(roles, StatusCodes.OK);
});

administrationRolesRouter.openapi(createRoleRoute, async (c) => {
  const roleDao = new DaoFactory().db.roleDao();
  const useCase = new CreateRole(roleDao);
  const data = c.req.valid('json');

  try {
    const created = await useCase.execute(data);

    return c.json(
      { message: `Role ${created.name} created successfully` },
      StatusCodes.OK
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Role name already exists'
    ) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'name', error: 'Role name already exists' }]
      });
    }

    if (error instanceof Error && error.message === 'Failed to create role') {
      throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
        message: error.message
      });
    }

    throw error;
  }
});

administrationRolesRouter.openapi(updateRoleRoute, async (c) => {
  const roleDao = new DaoFactory().db.roleDao();
  const useCase = new UpdateRole(roleDao);
  const { roleID } = c.req.valid('param');
  const roleId = parsePositiveIntegerParam(roleID);
  const data = c.req.valid('json');

  try {
    await useCase.execute(roleId, data);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Role name already exists'
    ) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'name', error: 'Role name already exists' }]
      });
    }

    if (error instanceof Error && error.message === 'Role not found') {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'roleID', error: `Role with id ${roleId} not found` }]
      });
    }

    throw error;
  }

  return c.json(
    { message: `Role with ID ${roleID} updated successfully` },
    StatusCodes.OK
  );
});

administrationRolesRouter.openapi(deleteRoleRoute, async (c) => {
  const roleDao = new DaoFactory().db.roleDao();
  const useCase = new DeleteRole(roleDao);
  const { roleID } = c.req.valid('param');
  const roleId = parsePositiveIntegerParam(roleID);

  try {
    await useCase.execute(roleId);
  } catch (error) {
    if (error instanceof Error && error.message === 'Role not found') {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'roleID', error: `Role with id ${roleId} not found` }]
      });
    }
    throw error;
  }

  return c.json(
    { message: `Role with ID ${roleID} deleted successfully` },
    StatusCodes.OK
  );
});

export default administrationRolesRouter;
