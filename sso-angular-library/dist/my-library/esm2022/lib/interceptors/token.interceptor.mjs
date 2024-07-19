import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../cookie.service";
export class TokenInterceptor {
    constructor(cookieService) {
        this.cookieService = cookieService;
    }
    intercept(request, next) {
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
            }
            else if (this.cookieService.get(this.cookieService.COOKIE_NAME) !== null) {
                const accessToken = this.cookieService.get(this.cookieService.COOKIE_NAME);
                const tokenType = this.cookieService.get('tokenType');
                request.headers.delete('Authorization');
                request = request.clone({
                    setHeaders: {
                        Authorization: `${tokenType} ${accessToken}`,
                        // Accept: 'application/json',
                    },
                });
            }
            else {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: TokenInterceptor, deps: [{ token: i1.CookieService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: TokenInterceptor }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: TokenInterceptor, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.CookieService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4uaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9teS1saWJyYXJ5L3NyYy9saWIvaW50ZXJjZXB0b3JzL3Rva2VuLmludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7OztBQVczQyxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQW9CLGFBQTRCO1FBQTVCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO0lBQUcsQ0FBQztJQUVwRCxTQUFTLENBQ1AsT0FBeUIsRUFDekIsSUFBaUI7UUFFakIsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxnREFBZ0QsQ0FBQyxFQUFFO1lBQzFFLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQkFDMUMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBRXhELElBQUksV0FBVyxFQUFFO29CQUNmLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO3dCQUN0QixVQUFVLEVBQUU7NEJBQ1YsS0FBSyxFQUFFLEdBQUcsV0FBVyxFQUFFOzRCQUN2Qiw4QkFBOEI7eUJBQy9CO3FCQUNGLENBQUMsQ0FBQztpQkFDSjthQUNGO2lCQUFNLElBQ0wsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQy9EO2dCQUNBLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUN4QyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FDL0IsQ0FBQztnQkFDRixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdEQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3hDLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO29CQUN0QixVQUFVLEVBQUU7d0JBQ1YsYUFBYSxFQUFFLEdBQUcsU0FBUyxJQUFJLFdBQVcsRUFBRTt3QkFDNUMsOEJBQThCO3FCQUMvQjtpQkFDRixDQUFDLENBQUM7YUFDSjtpQkFBTTtnQkFDTCxPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztvQkFDdEIsVUFBVSxFQUFFO3dCQUNWLGFBQWEsRUFBRSxFQUFFO3dCQUNqQixLQUFLLEVBQUUsRUFBRSxFQUFFLDJEQUEyRDtxQkFDdkU7aUJBQ0YsQ0FBQyxDQUFDO2FBQ0o7U0FDRjtRQUVELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QixDQUFDOytHQTVDVSxnQkFBZ0I7bUhBQWhCLGdCQUFnQjs7NEZBQWhCLGdCQUFnQjtrQkFENUIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEh0dHBSZXF1ZXN0LFxuICBIdHRwSGFuZGxlcixcbiAgSHR0cEV2ZW50LFxuICBIdHRwSW50ZXJjZXB0b3IsXG59IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IENvb2tpZVNlcnZpY2UgfSBmcm9tICcuLi9jb29raWUuc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUb2tlbkludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjb29raWVTZXJ2aWNlOiBDb29raWVTZXJ2aWNlKSB7fVxuXG4gIGludGVyY2VwdChcbiAgICByZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LFxuICAgIG5leHQ6IEh0dHBIYW5kbGVyXG4gICk6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICBpZiAocmVxdWVzdC51cmwuaW5jbHVkZXMoJ2h0dHBzOi8vc2VjdXJlYXV0aC5zZWN1cmVpZC1kaWdpdGFsLmNvbS5uZy9hcGknKSkge1xuICAgICAgaWYgKHJlcXVlc3QudXJsLmluY2x1ZGVzKCdhdXRoL2dldC10b2tlbicpKSB7XG4gICAgICAgIGNvbnN0IGFjY2Vzc1Rva2VuID0gdGhpcy5jb29raWVTZXJ2aWNlLmdldCgnYXBwUGFyYW1zJyk7XG5cbiAgICAgICAgaWYgKGFjY2Vzc1Rva2VuKSB7XG4gICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3QuY2xvbmUoe1xuICAgICAgICAgICAgc2V0SGVhZGVyczoge1xuICAgICAgICAgICAgICBCYXNpYzogYCR7YWNjZXNzVG9rZW59YCxcbiAgICAgICAgICAgICAgLy8gQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICB0aGlzLmNvb2tpZVNlcnZpY2UuZ2V0KHRoaXMuY29va2llU2VydmljZS5DT09LSUVfTkFNRSkgIT09IG51bGxcbiAgICAgICkge1xuICAgICAgICBjb25zdCBhY2Nlc3NUb2tlbiA9IHRoaXMuY29va2llU2VydmljZS5nZXQoXG4gICAgICAgICAgdGhpcy5jb29raWVTZXJ2aWNlLkNPT0tJRV9OQU1FXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHRva2VuVHlwZSA9IHRoaXMuY29va2llU2VydmljZS5nZXQoJ3Rva2VuVHlwZScpO1xuICAgICAgICByZXF1ZXN0LmhlYWRlcnMuZGVsZXRlKCdBdXRob3JpemF0aW9uJyk7XG4gICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LmNsb25lKHtcbiAgICAgICAgICBzZXRIZWFkZXJzOiB7XG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgJHt0b2tlblR5cGV9ICR7YWNjZXNzVG9rZW59YCxcbiAgICAgICAgICAgIC8vIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3QuY2xvbmUoe1xuICAgICAgICAgIHNldEhlYWRlcnM6IHtcbiAgICAgICAgICAgIEF1dGhvcml6YXRpb246ICcnLFxuICAgICAgICAgICAgQmFzaWM6IGBgLCAvLyBDbGVhciB0aGUgQXV0aG9yaXphdGlvbiBoZWFkZXIgaWYgdG9rZW4gaXMgbm90IGF2YWlsYWJsZVxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXF1ZXN0KTtcbiAgfVxufVxuIl19