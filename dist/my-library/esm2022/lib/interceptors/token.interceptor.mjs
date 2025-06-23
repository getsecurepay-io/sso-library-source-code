import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../cookie.service";
export class TokenInterceptor {
    constructor(cookieService) {
        this.cookieService = cookieService;
    }
    intercept(request, next) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4uaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9teS1saWJyYXJ5L3NyYy9saWIvaW50ZXJjZXB0b3JzL3Rva2VuLmludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7OztBQVczQyxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQW9CLGFBQTRCO1FBQTVCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO0lBQUcsQ0FBQztJQUVwRCxTQUFTLENBQ1AsT0FBeUIsRUFDekIsSUFBaUI7UUFFakIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUU3QyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFbkQsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFFbEQsSUFBSSxXQUFXLEVBQUU7b0JBQ2pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQzdDLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO3dCQUN0QixVQUFVLEVBQUU7NEJBQ1YsS0FBSyxFQUFFLEdBQUcsV0FBVyxFQUFFOzRCQUN2Qiw4QkFBOEI7eUJBQy9CO3FCQUNGLENBQUMsQ0FBQztvQkFFTCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO2lCQUV0QzthQUNGO2lCQUFNLElBQ0wsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQy9EO2dCQUNBLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUN4QyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FDL0IsQ0FBQztnQkFDRixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdEQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3hDLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO29CQUN0QixVQUFVLEVBQUU7d0JBQ1YsYUFBYSxFQUFFLEdBQUcsU0FBUyxJQUFJLFdBQVcsRUFBRTt3QkFDNUMsOEJBQThCO3FCQUMvQjtpQkFDRixDQUFDLENBQUM7YUFDSjtpQkFBTTtnQkFDTCxPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztvQkFDdEIsVUFBVSxFQUFFO3dCQUNWLGFBQWEsRUFBRSxFQUFFO3dCQUNqQixLQUFLLEVBQUUsRUFBRSxFQUFFLDJEQUEyRDtxQkFDdkU7aUJBQ0YsQ0FBQyxDQUFDO2FBQ0o7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QixDQUFDOytHQXZEVSxnQkFBZ0I7bUhBQWhCLGdCQUFnQjs7NEZBQWhCLGdCQUFnQjtrQkFENUIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEh0dHBSZXF1ZXN0LFxuICBIdHRwSGFuZGxlcixcbiAgSHR0cEV2ZW50LFxuICBIdHRwSW50ZXJjZXB0b3IsXG59IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IENvb2tpZVNlcnZpY2UgfSBmcm9tICcuLi9jb29raWUuc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUb2tlbkludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjb29raWVTZXJ2aWNlOiBDb29raWVTZXJ2aWNlKSB7fVxuXG4gIGludGVyY2VwdChcbiAgICByZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LFxuICAgIG5leHQ6IEh0dHBIYW5kbGVyXG4gICk6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICBjb25zdCBzc29VcmwgPSB0aGlzLmNvb2tpZVNlcnZpY2UuZ2V0KCdzc28nKSB8fCAnJztcbiAgICBjb25zb2xlLmxvZyhzc29VcmwpO1xuICAgIGNvbnNvbGUubG9nKCdvcmlnaW5hbCByZXF1ZXN0ID09PicsIHJlcXVlc3QpO1xuXG4gICAgaWYgKHJlcXVlc3QudXJsLmluY2x1ZGVzKHNzb1VybCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdpZiByZXF1ZXN0IGhhcyBzc28gdXJsID09PicsIHJlcXVlc3QpO1xuXG4gICAgICBpZiAocmVxdWVzdC51cmwuaW5jbHVkZXMoJ2F1dGgvZ2V0LXRva2VuJykpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2lmIHJlcXVlc3QgaGFzIGF1dGgvZ2V0LXRva2VuID09PicsIHJlcXVlc3QpO1xuICAgICAgICBjb25zdCBhY2Nlc3NUb2tlbiA9IHRoaXMuY29va2llU2VydmljZS5nZXQoJ2FwcFBhcmFtcycpO1xuICAgICAgICBjb25zb2xlLmxvZygnYWNjZXNzVG9rZW4gdmFsdWUgPT0+JywgYWNjZXNzVG9rZW4pO1xuXG4gICAgICAgIGlmIChhY2Nlc3NUb2tlbikge1xuICAgICAgICBjb25zb2xlLmxvZygnaWYgYXBwUGFyYW1zIGV4aXN0ID09PicsIHJlcXVlc3QpO1xuICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LmNsb25lKHtcbiAgICAgICAgICAgIHNldEhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgQmFzaWM6IGAke2FjY2Vzc1Rva2VufWAsXG4gICAgICAgICAgICAgIC8vIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zb2xlLmxvZygnYWZ0ZXIgbW9kcyA9PT4nLCByZXF1ZXN0KTtcblxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICB0aGlzLmNvb2tpZVNlcnZpY2UuZ2V0KHRoaXMuY29va2llU2VydmljZS5DT09LSUVfTkFNRSkgIT09IG51bGxcbiAgICAgICkge1xuICAgICAgICBjb25zdCBhY2Nlc3NUb2tlbiA9IHRoaXMuY29va2llU2VydmljZS5nZXQoXG4gICAgICAgICAgdGhpcy5jb29raWVTZXJ2aWNlLkNPT0tJRV9OQU1FXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHRva2VuVHlwZSA9IHRoaXMuY29va2llU2VydmljZS5nZXQoJ3Rva2VuVHlwZScpO1xuICAgICAgICByZXF1ZXN0LmhlYWRlcnMuZGVsZXRlKCdBdXRob3JpemF0aW9uJyk7XG4gICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LmNsb25lKHtcbiAgICAgICAgICBzZXRIZWFkZXJzOiB7XG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgJHt0b2tlblR5cGV9ICR7YWNjZXNzVG9rZW59YCxcbiAgICAgICAgICAgIC8vIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3QuY2xvbmUoe1xuICAgICAgICAgIHNldEhlYWRlcnM6IHtcbiAgICAgICAgICAgIEF1dGhvcml6YXRpb246ICcnLFxuICAgICAgICAgICAgQmFzaWM6IGBgLCAvLyBDbGVhciB0aGUgQXV0aG9yaXphdGlvbiBoZWFkZXIgaWYgdG9rZW4gaXMgbm90IGF2YWlsYWJsZVxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxdWVzdCk7XG4gIH1cbn1cbiJdfQ==