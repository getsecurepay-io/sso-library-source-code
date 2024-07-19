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
    const ssoUrl = this.cookieService.get('sso') || '';
    console.log(ssoUrl);
    console.log('original request ==>', request);

    if (request.url.includes(ssoUrl)) {
      console.log('if request has sso url ==>', request);

      if (request.url.includes('auth/get-token')) {
        console.log('if request has auth/get-token ==>', request);
        const accessToken = this.cookieService.get('appParams');
        console.log('accessToken value ==>', accessToken);

        if (accessToken) {
        console.log('if appParams exist ==>', request);
          request = request.clone({
            setHeaders: {
              Basic: `${accessToken}`,
              // Accept: 'application/json',
            },
          });

        console.log('after mods ==>', request);

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
