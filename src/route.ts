import * as grpc from 'grpc';
import { loadSync } from '@grpc/proto-loader';


// Can consider using some interceptor to implement the authenication as middleware?
// e.g. https://github.com/echo-health/node-grpc-interceptors

export const authenicate = (next: Function): Function => {
  return (call: any, callback: Function) => {
    const metadata:grpc.Metadata = call.metadata as grpc.Metadata;


    // If not authenicated
    const error: any = new Error('Unauthorized');
    error.code = grpc.status.PERMISSION_DENIED;
    // return callback(error);

    // move forward
    next(call, callback);
  }
}

/**
 *
 * @param call
 * @param callback
 */
export const sayHello = async (call: any, callback: Function) => {
  return callback(null, 'hello');
}

export const route = (server: grpc.Server) => {
    const helloDefination = loadSync('./proto/hello.proto');
    const helloProto = grpc.loadPackageDefinition(helloDefination);
    server.addService(helloProto.HelloService.service, {
        hello: authenicate(sayHello)
    });
}

