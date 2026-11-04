import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta?: any;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode || 200;

    return next.handle().pipe(
      map((result) => {
        // If already formatted with success property
        if (result && typeof result === 'object' && 'success' in result) {
          return {
            statusCode,
            timestamp: new Date().toISOString(),
            ...result,
          };
        }

        return {
          success: true,
          statusCode,
          message: 'Operation completed successfully',
          data: result,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
