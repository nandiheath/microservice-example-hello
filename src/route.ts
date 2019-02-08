import * as grpc from 'grpc';
import { loadSync } from '@grpc/proto-loader';
import { verify } from './auth/auth';


interface IAuthInfo {
  username: string
}
// Can consider using some interceptor to implement the authenication as middleware?
// e.g. https://github.com/echo-health/node-grpc-interceptors

export const authenicate = (next: Function): Function => {
  return async (call: any, callback: Function): Promise<void> => {
    const metadata:grpc.Metadata = call.metadata as grpc.Metadata;
    const header = metadata.get('authorization');
    let payload: IAuthInfo | null = null;

    if (header.length === 0) {
      payload = null;
    } else {
      try {
        // Try to get the token from "Bearer {token}"
        const token = header[0].toString().split(' ')[1];
        payload = await verify(token);
      } catch (err) {
        payload = null;
      }
    }

    if (payload === null) {
      // If not authenicated
      const error: any = new Error('Unauthenicated');
      error.code = grpc.status.PERMISSION_DENIED;
      return callback(error);
    }


    // move forward
    next(call, callback, payload);
  }
}

/**
 *
 * @param call
 * @param callback
 */
export const sayHello = async (call: any, callback: Function, payload: IAuthInfo) => {
  return callback(null, `Hello ${payload.username}`);
}

export const route = (server: grpc.Server) => {
    const helloDefination = loadSync('./proto/hello.proto');
    const helloProto = grpc.loadPackageDefinition(helloDefination);
    server.addService(helloProto.HelloService.service, {
        hello: authenicate(sayHello)
    });
}

