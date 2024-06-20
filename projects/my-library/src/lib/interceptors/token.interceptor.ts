import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from '../cookie.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private cookieService: CookieService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.url.includes('https://secureauth.secureid-digital.com.ng/api')) {
      if (request.url.includes('auth/get-token')) {
        const accessToken = this.cookieService.get('appParams');

        if (accessToken) {
          request = request.clone({
            setHeaders: {
              Basic: `${accessToken}`,
              // Accept: 'application/json',
            },
          });
        }
      } else if (
        this.cookieService.get(this.cookieService.COOKIE_NAME) !== null
      ) {
        const accessToken = this.cookieService.get(
          this.cookieService.COOKIE_NAME
        );
        const tokenType = this.cookieService.get('tokenType');
        request.headers.delete('Authorization');
        request = request.clone({
          setHeaders: {
            Authorization: `${tokenType} ${accessToken}`,
            // Accept: 'application/json',
          },
        });
      } else {
        request = request.clone({
          setHeaders: {
            Authorization: '',
            Basic: ``, // Clear the Authorization header if token is not available
          },
        });
      }
    }

    return next.handle(request);
  }
}
