import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

import { RepositoryFactory } from '@/infrastucture/factories/RepositoryFactory';
import { defaultHook } from '@/shared/api/openapi/defaultHook';
import { ENV } from '@/shared/types/honoENV';

import { DeleteDevice } from '../application/use-case/deleteDevice';
import { GetDeviceById } from '../application/use-case/getDeviceById';
import { GetDevices } from '../application/use-case/getDevices';
import { GetDevicesTotal } from '../application/use-case/getDevicesTotal';
import { UpdateDevice } from '../application/use-case/updateDevice';
import {
  deleteDeviceRoute,
  getAdministrationDevicesRoute,
  getDeviceByIdRoute,
  getDevicesRoute,
  getDevicesTotalRoute,
  updateDeviceRoute,
} from './devices.openapi';

const administrationDevicesRouter = new OpenAPIHono<ENV>({ defaultHook });

administrationDevicesRouter.openapi(getAdministrationDevicesRoute, (c) => {
  return c.json(
    {
      module: 'administration/devices',
      status: 'dummy' as const,
      message: 'Dummy endpoint for administration devices',
    },
    StatusCodes.OK,
  );
});

administrationDevicesRouter.openapi(getDevicesRoute, async (c) => {
  const query = c.req.valid('query');
  const repository = new RepositoryFactory().deviceRepository();
  const useCase = new GetDevices(repository);

  const devices = await useCase.execute(query);
  return c.json(devices, StatusCodes.OK);
});

administrationDevicesRouter.openapi(getDevicesTotalRoute, async (c) => {
  const repository = new RepositoryFactory().deviceRepository();
  const useCase = new GetDevicesTotal(repository);

  const total = await useCase.execute();
  return c.json({ total }, StatusCodes.OK);
});

administrationDevicesRouter.openapi(getDeviceByIdRoute, async (c) => {
  const { deviceID } = c.req.valid('param');

  const repository = new RepositoryFactory().deviceRepository();
  const useCase = new GetDeviceById(repository);

  try {
    const device = await useCase.execute(deviceID);
    return c.json(device, StatusCodes.OK);
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'deviceID', error: err.message }],
      });
    }
    throw err;
  }
});

administrationDevicesRouter.openapi(updateDeviceRoute, async (c) => {
  const { deviceID } = c.req.valid('param');
  const body = c.req.valid('json');

  const repository = new RepositoryFactory().deviceRepository();
  const useCase = new UpdateDevice(repository);

  try {
    await useCase.execute(deviceID, body);

    return c.json(
      { message: `Device with ID ${deviceID} updated successfully` },
      StatusCodes.OK,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'deviceID', error: err.message }],
      });
    }

    if (err instanceof Error && err.message === 'No changes detected') {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'body', error: err.message }],
      });
    }

    throw err;
  }
});

administrationDevicesRouter.openapi(deleteDeviceRoute, async (c) => {
  const { deviceID } = c.req.valid('param');

  const repository = new RepositoryFactory().deviceRepository();
  const useCase = new DeleteDevice(repository);

  try {
    await useCase.execute(deviceID);

    return c.json(
      { message: `Device with ID ${deviceID} deleted successfully` },
      StatusCodes.OK,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'deviceID', error: err.message }],
      });
    }
    throw err;
  }
});

export default administrationDevicesRouter;
