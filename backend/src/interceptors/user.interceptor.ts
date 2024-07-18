import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map((user) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userRest } = user;
            return userRest;
          });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...userRest } = data;
          return userRest;
        }
      }),
    );
  }
}
