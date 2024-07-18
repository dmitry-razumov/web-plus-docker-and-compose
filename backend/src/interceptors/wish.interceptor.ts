import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class WishInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map((user) => {
            const {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              owner: { password, ...ownerRest },
              ...rest
            } = user;
            return { ...rest, owner: ownerRest };
          });
        } else {
          data?.offers?.map((offer) => {
            delete offer.user.password;
            return offer;
          });
          const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            owner: { password, ...ownerRest },
            ...rest
          } = data;
          return { ...rest, owner: ownerRest };
        }
      }),
    );
  }
}
