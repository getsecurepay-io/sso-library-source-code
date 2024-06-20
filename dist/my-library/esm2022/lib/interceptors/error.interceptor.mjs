import { Injectable } from '@angular/core';
import { HttpResponse, } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import * as i0 from "@angular/core";
export class ErrorInterceptor {
    constructor() {
        this.errorMessage = '';
    }
    intercept(request, next) {
        // TODO: show loading spinner as request starts here
        return next.handle(request).pipe(tap((evt) => {
            if (evt instanceof HttpResponse) {
                // TODO: if request is successful, hide spinners
                if (evt.body.error == true) {
                    // TODO: if error is a frontend error, like network, notify user
                    // this.errorMessage = evt.body.message;
                    // this.notification.danger(this.errorMessage);
                }
            }
        }), catchError((error) => {
            // TODO: if request fails, hide spinners
            if (error.error instanceof ErrorEvent) {
                //client-side error
                this.errorMessage = `Error: ${error.error.message}`;
            }
            else {
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
        }));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: ErrorInterceptor, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: ErrorInterceptor }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: ErrorInterceptor, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9teS1saWJyYXJ5L3NyYy9saWIvaW50ZXJjZXB0b3JzL2Vycm9yLmludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUtMLFlBQVksR0FFYixNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBYyxVQUFVLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQzs7QUFHL0QsTUFBTSxPQUFPLGdCQUFnQjtJQUczQjtRQUZBLGlCQUFZLEdBQVcsRUFBRSxDQUFDO0lBSXZCLENBQUM7SUFFSixTQUFTLENBQ1AsT0FBeUIsRUFDekIsSUFBaUI7UUFFakIsb0RBQW9EO1FBRXBELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQzlCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ1YsSUFBSSxHQUFHLFlBQVksWUFBWSxFQUFFO2dCQUMvQixnREFBZ0Q7Z0JBQ2hELElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO29CQUMxQixnRUFBZ0U7b0JBQ2hFLHdDQUF3QztvQkFDeEMsK0NBQStDO2lCQUNoRDthQUNGO1FBQ0gsQ0FBQyxDQUFDLEVBRUYsVUFBVSxDQUFDLENBQUMsS0FBd0IsRUFBRSxFQUFFO1lBQ3RDLHdDQUF3QztZQUV4QyxJQUFJLEtBQUssQ0FBQyxLQUFLLFlBQVksVUFBVSxFQUFFO2dCQUNyQyxtQkFBbUI7Z0JBQ25CLElBQUksQ0FBQyxZQUFZLEdBQUcsVUFBVSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3JEO2lCQUFNO2dCQUNMLG9CQUFvQjtnQkFFcEIsUUFBUSxLQUFLLENBQUMsTUFBTSxFQUFFO29CQUNwQixLQUFLLEdBQUcsQ0FBQyxDQUFDO3dCQUNSLElBQUksQ0FBQyxZQUFZLEdBQUcsdUJBQXVCLENBQUM7d0JBQzVDLCtDQUErQzt3QkFDL0MsTUFBTTtxQkFDUDtvQkFDRCxLQUFLLEdBQUcsQ0FBQyxDQUFDO3dCQUNSLElBQUksQ0FBQyxZQUFZLEdBQUcsdUJBQXVCLENBQUM7d0JBQzVDLHdFQUF3RTt3QkFDeEUsTUFBTTtxQkFDUDtvQkFDRCxLQUFLLEdBQUcsQ0FBQyxDQUFDO3dCQUNSLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO3dCQUM3QyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQzt3QkFDMUMsMENBQTBDO3dCQUMxQyxNQUFNO3FCQUNQO29CQUNELEtBQUssR0FBRyxDQUFDLENBQUM7d0JBQ1Isc0RBQXNEO3dCQUN0RCxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQzt3QkFDN0MsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7d0JBQzFDLCtDQUErQzt3QkFDL0MsTUFBTTtxQkFDUDtvQkFDRCxLQUFLLEdBQUcsQ0FBQyxDQUFDO3dCQUNSLHNEQUFzRDt3QkFDdEQsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7d0JBQ3pGLDRDQUE0Qzt3QkFDNUMsNkNBQTZDO3dCQUM3QyxNQUFNO3FCQUNQO29CQUNELEtBQUssR0FBRyxDQUFDLENBQUM7d0JBQ1IsNEJBQTRCO3dCQUM1QixvQkFBb0I7d0JBQ3BCLEtBQUs7d0JBQ0wsZ0RBQWdEO3dCQUNoRCxtQ0FBbUM7d0JBQ25DLE1BQU07cUJBQ1A7b0JBQ0QsS0FBSyxHQUFHLENBQUMsQ0FBQzt3QkFDUixpREFBaUQ7d0JBQ2pELGdEQUFnRDt3QkFDaEQsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxxQkFBcUIsQ0FBQzt3QkFDckUsa0RBQWtEO3dCQUNsRCxtQ0FBbUM7d0JBQ25DLE1BQU07cUJBQ1A7b0JBQ0QsS0FBSyxHQUFHLENBQUMsQ0FBQzt3QkFDUixJQUFJLENBQUMsWUFBWSxHQUFHLHVCQUF1QixDQUFDO3dCQUM1QywrQ0FBK0M7d0JBQy9DLE1BQU07cUJBQ1A7b0JBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQzt3QkFDTixJQUFJLENBQUMsWUFBWTs0QkFDZixrREFBa0QsQ0FBQzt3QkFDckQsK0NBQStDO3dCQUMvQyxNQUFNO3FCQUNQO2lCQUNGO2FBQ0Y7WUFFRCxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7K0dBbEdVLGdCQUFnQjttSEFBaEIsZ0JBQWdCOzs0RkFBaEIsZ0JBQWdCO2tCQUQ1QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgSHR0cFJlcXVlc3QsXG4gIEh0dHBIYW5kbGVyLFxuICBIdHRwRXZlbnQsXG4gIEh0dHBJbnRlcmNlcHRvcixcbiAgSHR0cFJlc3BvbnNlLFxuICBIdHRwRXJyb3JSZXNwb25zZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgY2F0Y2hFcnJvciwgdGFwLCB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBFcnJvckludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcbiAgZXJyb3JNZXNzYWdlOiBzdHJpbmcgPSAnJztcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvLyBwcml2YXRlIHJlYWRvbmx5IG5vdGlmaWNhdGlvbjogTm90aWZpY2F0aW9uU2VydmljZVxuICApIHt9XG5cbiAgaW50ZXJjZXB0KFxuICAgIHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sXG4gICAgbmV4dDogSHR0cEhhbmRsZXJcbiAgKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIC8vIFRPRE86IHNob3cgbG9hZGluZyBzcGlubmVyIGFzIHJlcXVlc3Qgc3RhcnRzIGhlcmVcblxuICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXF1ZXN0KS5waXBlKFxuICAgICAgdGFwKChldnQpID0+IHtcbiAgICAgICAgaWYgKGV2dCBpbnN0YW5jZW9mIEh0dHBSZXNwb25zZSkge1xuICAgICAgICAgIC8vIFRPRE86IGlmIHJlcXVlc3QgaXMgc3VjY2Vzc2Z1bCwgaGlkZSBzcGlubmVyc1xuICAgICAgICAgIGlmIChldnQuYm9keS5lcnJvciA9PSB0cnVlKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBpZiBlcnJvciBpcyBhIGZyb250ZW5kIGVycm9yLCBsaWtlIG5ldHdvcmssIG5vdGlmeSB1c2VyXG4gICAgICAgICAgICAvLyB0aGlzLmVycm9yTWVzc2FnZSA9IGV2dC5ib2R5Lm1lc3NhZ2U7XG4gICAgICAgICAgICAvLyB0aGlzLm5vdGlmaWNhdGlvbi5kYW5nZXIodGhpcy5lcnJvck1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSksXG5cbiAgICAgIGNhdGNoRXJyb3IoKGVycm9yOiBIdHRwRXJyb3JSZXNwb25zZSkgPT4ge1xuICAgICAgICAvLyBUT0RPOiBpZiByZXF1ZXN0IGZhaWxzLCBoaWRlIHNwaW5uZXJzXG5cbiAgICAgICAgaWYgKGVycm9yLmVycm9yIGluc3RhbmNlb2YgRXJyb3JFdmVudCkge1xuICAgICAgICAgIC8vY2xpZW50LXNpZGUgZXJyb3JcbiAgICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9IGBFcnJvcjogJHtlcnJvci5lcnJvci5tZXNzYWdlfWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gc2VydmVyLXNpZGUgZXJyb3JcblxuICAgICAgICAgIHN3aXRjaCAoZXJyb3Iuc3RhdHVzKSB7XG4gICAgICAgICAgICBjYXNlIDUwMzoge1xuICAgICAgICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InO1xuICAgICAgICAgICAgICAvLyB0aGlzLm5vdGlmaWNhdGlvbi5kYW5nZXIodGhpcy5lcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgNTAwOiB7XG4gICAgICAgICAgICAgIHRoaXMuZXJyb3JNZXNzYWdlID0gJ0ludGVybmFsIFNlcnZlciBFcnJvcic7XG4gICAgICAgICAgICAgIC8vIHRoaXMubm90aWZpY2F0aW9uLmVycm9yKHRoaXMuZXJyb3JNZXNzYWdlLCAncGxlYXNlIHRyeSBhZ2FpbiBsYXRlcicpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgNDAwOiB7XG4gICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yLmVycm9yLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICB0aHJvd0Vycm9yKCgpID0+IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgLy8gdGhpcy5ub3RpZmljYXRpb24uZGFuZ2VyKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSA0MDQ6IHtcbiAgICAgICAgICAgICAgLy8gdGhpcy5lcnJvck1lc3NhZ2UgPSAnQW4gRXJyb3IgT2NjdXJyZWQsIHRyeSBhZ2Fpbic7XG4gICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yLmVycm9yLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICB0aHJvd0Vycm9yKCgpID0+IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgLy8gdGhpcy5ub3RpZmljYXRpb24uZGFuZ2VyKHRoaXMuZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIDQwNjoge1xuICAgICAgICAgICAgICAvLyB0aGlzLmVycm9yTWVzc2FnZSA9ICdBbiBFcnJvciBPY2N1cnJlZCwgdHJ5IGFnYWluJztcbiAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IuZXJyb3JbJ2Rlc2NyaXB0aW9uJ10uc3BsaXQoJy4nKVsxXSB8fCBlcnJvci5lcnJvci5kZXNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgLy8gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKSlcbiAgICAgICAgICAgICAgLy8gdGhpcy5ub3RpZmljYXRpb24uZXJyb3IoZXJyb3JNZXNzYWdlLCAnJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSA0MDM6IHtcbiAgICAgICAgICAgICAgLy8gdGhpcy5ub3RpZmljYXRpb24uZGFuZ2VyKFxuICAgICAgICAgICAgICAvLyAgICdBY2Nlc3MgRGVuaWVkJ1xuICAgICAgICAgICAgICAvLyApO1xuICAgICAgICAgICAgICAvLyBUT0RPOiBsb2cgdXNlciBvdXQgYW5kIG5hdmlnYXRlIHRvIGxvZ2luIHBhZ2VcbiAgICAgICAgICAgICAgLy8gdGhpcy5yb3V0ZXIubmF2aWdhdGUoWycvYXV0aCddKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIDQwMToge1xuICAgICAgICAgICAgICAvLyB0aGlzLm5vdGlmaWNhdGlvbi5kYW5nZXIoJ1Nlc3Npb24gVGltZWQgT3V0Jyk7XG4gICAgICAgICAgICAgIC8vIFRPRE86IGxvZyB1c2VyIG91dCBhbmQgbmF2aWdhdGUgdG8gbG9naW4gcGFnZVxuICAgICAgICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9IGVycm9yLmVycm9yLmRlc2NyaXB0aW9uIHx8ICdVc2VyIG5vdCBhdXRob3JpemVkJztcbiAgICAgICAgICAgICAgLy8gdGhpcy5ub3RpZmljYXRpb24uZXJyb3IodGhpcy5lcnJvck1lc3NhZ2UsICcnKTtcbiAgICAgICAgICAgICAgLy8gdGhpcy5yb3V0ZXIubmF2aWdhdGUoWycvYXV0aCddKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIDQwNToge1xuICAgICAgICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InO1xuICAgICAgICAgICAgICAvLyB0aGlzLm5vdGlmaWNhdGlvbi5kYW5nZXIodGhpcy5lcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgMDoge1xuICAgICAgICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgJ0Nvbm5lY3Rpb24gRXJyb3IuIENoZWNrIFlvdXIgSW50ZXJuZXQgQ29ubmVjdGlvbic7XG4gICAgICAgICAgICAgIC8vIHRoaXMubm90aWZpY2F0aW9uLmRhbmdlcih0aGlzLmVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yLmVycm9yKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuIl19