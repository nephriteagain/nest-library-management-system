import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class RedirectInterceptor implements NestInterceptor {
  private readonly redirectRegex: {regex:RegExp, route: string}[];

  constructor(redirectRegex: {regex:RegExp, route: string}[]) {
    this.redirectRegex = redirectRegex;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request : Request = context.switchToHttp().getRequest();
    console.log('intercept')
    // Check if the requested path matches the redirect regex
    const match = this.redirectRegex.find(item => item.regex.test(request.path))
    console.log({match})
    if (match) {
      // Redirect to '/'
      console.log(`${request.path} intercepted, redirecting to "/"`)
      return next.handle().pipe(
        tap(() => {
          const response : Response = context.switchToHttp().getResponse();
          response.header('X-Redirect', match.route)
          response.redirect('/');
        }),
      );
    }

    // Continue with the original request
    return next.handle();
  }
}