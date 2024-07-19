import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  errorMessage: string = '';

  constructor(
    // private readonly notification: NotificationService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // TODO: show loading spinner as request starts here

    return next.handle(request).pipe(
      tap((evt) => {
        if (evt instanceof HttpResponse) {
          // TODO: if request is successful, hide spinners
          if (evt.body.error == true) {
            // TODO: if error is a frontend error, like network, notify user
            // this.errorMessage = evt.body.message;
            // this.notification.danger(this.errorMessage);
          }
        }
      }),

      catchError((error: HttpErrorResponse) => {
        // TODO: if request fails, hide spinners

        if (error.error instanceof ErrorEvent) {
          //client-side error
          this.errorMessage = `Error: ${error.error.message}`;
        } else {
          // server-side error

          switch (error.status) {
            case 503: {
              this.errorMessage = 'Internal Server Error';
              // this.notification.danger(this.errorMessage);
              break;
            }
            case 500: {
              this.errorMessage = 'Internal Server Error';
              // this.notification.error(this.errorMessage, 'please try again later');
              break;
            }
            case 400: {
              const errorMessage = error.error.description;
              throwError(() => new Error(errorMessage));
              // this.notification.danger(errorMessage);
              break;
            }
            case 404: {
              // this.errorMessage = 'An Error Occurred, try again';
              const errorMessage = error.error.description;
              throwError(() => new Error(errorMessage));
              // this.notification.danger(this.errorMessage);
              break;
            }
            case 406: {
              // this.errorMessage = 'An Error Occurred, try again';
              const errorMessage = error.error['description'].split('.')[1] || error.error.description;
              // throwError(() => new Error(errorMessage))
              // this.notification.error(errorMessage, '');
              break;
            }
            case 403: {
              // this.notification.danger(
              //   'Access Denied'
              // );
              // TODO: log user out and navigate to login page
              // this.router.navigate(['/auth']);
              break;
            }
            case 401: {
              // this.notification.danger('Session Timed Out');
              // TODO: log user out and navigate to login page
              this.errorMessage = error.error.description || 'User not authorized';
              // this.notification.error(this.errorMessage, '');
              // this.router.navigate(['/auth']);
              break;
            }
            case 405: {
              this.errorMessage = 'Internal Server Error';
              // this.notification.danger(this.errorMessage);
              break;
            }
            case 0: {
              this.errorMessage =
                'Connection Error. Check Your Internet Connection';
              // this.notification.danger(this.errorMessage);
              break;
            }
          }
        }

        return throwError(error.error);
      })
    );
  }
}
