import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "./cookie.service";
export class AppSetupService {
    constructor(http, cookieStorage) {
        this.http = http;
        this.cookieStorage = cookieStorage;
        this.baseUrl = 'https://secureauth.secureid-digital.com.ng/api';
        this.appIsSetup = false;
        this.query = 'eyJDbGllbnRJZCI6InNzby5hZG1pbi5jbGllbnQiLCJDbGllbnRTZWNyZXQiOiJIOFN2Qkd0c3hzOXVvb2c2MHN0MlUwaWw1TzlpR1BWRWtmQjluWExlNEdwWlBlRExqYk8xRUZacWFMTlBScjFNIiwiR3JhbnRUeXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIn0=';
    }
    initializeApp(query = this.query) {
        const appParams = query['params'];
        if (!appParams) {
            const error = {
                title: 'App Params Missing',
                message: 'Please go back to the admin app',
                type: 'error',
            };
            return error;
        }
        const role = query['role'];
        this.cookieStorage.set('appParams', appParams);
        this.cookieStorage.set('role', role);
        return this.appInit();
    }
    appInit() {
        this.http.post(`${this.baseUrl}/auth/get-token`, {}).subscribe({
            next: (res) => {
                if (res) {
                    return this.setupApp(res);
                }
                const error = {
                    title: 'App Params Missing',
                    message: 'Please go back to the admin app',
                    type: 'error',
                };
                return error;
            },
            error: (err) => {
                const error = {
                    title: 'App Params Missing',
                    message: `Something went wrong, Please refresh the app`,
                    type: 'error',
                };
                return error;
            },
        });
    }
    setupApp(data) {
        this.appIsSetup = true;
        this.cookieStorage.remove('appParams');
        this.cookieStorage.set('redirectUrl', data.client.redirectUri, data.expiresIn);
        this.cookieStorage.set('accessToken', data.accessToken, data.expiresIn);
        this.cookieStorage.set('tokenType', data.tokenType, data.expiresIn);
        return {
            title: 'Success',
            message: 'Items saved to cookies storage',
            type: 'success',
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AppSetupService, deps: [{ token: i1.HttpClient }, { token: i2.CookieService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AppSetupService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AppSetupService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return [{ type: i1.HttpClient }, { type: i2.CookieService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXNldHVwLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9teS1saWJyYXJ5L3NyYy9saWIvYXBwLXNldHVwLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7OztBQU8zQyxNQUFNLE9BQU8sZUFBZTtJQU0xQixZQUNtQixJQUFnQixFQUNoQixhQUE0QjtRQUQ1QixTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ2hCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBUHZDLFlBQU8sR0FBRyxnREFBZ0QsQ0FBQztRQUMzRCxlQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ25CLFVBQUssR0FDWCxzTUFBc00sQ0FBQztJQUt0TSxDQUFDO0lBRUosYUFBYSxDQUFDLFFBQWEsSUFBSSxDQUFDLEtBQUs7UUFDbkMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDZCxNQUFNLEtBQUssR0FBRztnQkFDWixLQUFLLEVBQUUsb0JBQW9CO2dCQUMzQixPQUFPLEVBQUUsaUNBQWlDO2dCQUMxQyxJQUFJLEVBQUUsT0FBTzthQUNkLENBQUM7WUFDRixPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTNCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckMsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVPLE9BQU87UUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBWSxHQUFHLElBQUksQ0FBQyxPQUFPLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUN4RSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDWixJQUFJLEdBQUcsRUFBRTtvQkFDUCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzNCO2dCQUNELE1BQU0sS0FBSyxHQUFHO29CQUNaLEtBQUssRUFBRSxvQkFBb0I7b0JBQzNCLE9BQU8sRUFBRSxpQ0FBaUM7b0JBQzFDLElBQUksRUFBRSxPQUFPO2lCQUNkLENBQUM7Z0JBQ0YsT0FBTyxLQUFLLENBQUM7WUFDZixDQUFDO1lBQ0QsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ2IsTUFBTSxLQUFLLEdBQUc7b0JBQ1osS0FBSyxFQUFFLG9CQUFvQjtvQkFDM0IsT0FBTyxFQUFFLDhDQUE4QztvQkFDdkQsSUFBSSxFQUFFLE9BQU87aUJBQ2QsQ0FBQztnQkFDRixPQUFPLEtBQUssQ0FBQztZQUNmLENBQUM7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sUUFBUSxDQUFDLElBQWU7UUFDOUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQ3BCLGFBQWEsRUFDYixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FDZixDQUFDO1FBQ0YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hFLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwRSxPQUFPO1lBQ0wsS0FBSyxFQUFFLFNBQVM7WUFDaEIsT0FBTyxFQUFFLGdDQUFnQztZQUN6QyxJQUFJLEVBQUUsU0FBUztTQUNoQixDQUFDO0lBQ0osQ0FBQzsrR0FuRVUsZUFBZTttSEFBZixlQUFlLGNBRmQsTUFBTTs7NEZBRVAsZUFBZTtrQkFIM0IsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29va2llU2VydmljZSB9IGZyb20gJy4vY29va2llLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXBwUGFyYW1zIH0gZnJvbSAnLi9tb2RlbCc7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxufSlcbmV4cG9ydCBjbGFzcyBBcHBTZXR1cFNlcnZpY2Uge1xuICBwcml2YXRlIGJhc2VVcmwgPSAnaHR0cHM6Ly9zZWN1cmVhdXRoLnNlY3VyZWlkLWRpZ2l0YWwuY29tLm5nL2FwaSc7XG4gIHByaXZhdGUgYXBwSXNTZXR1cCA9IGZhbHNlO1xuICBwcml2YXRlIHF1ZXJ5ID1cbiAgICAnZXlKRGJHbGxiblJKWkNJNkluTnpieTVoWkcxcGJpNWpiR2xsYm5RaUxDSkRiR2xsYm5SVFpXTnlaWFFpT2lKSU9GTjJRa2QwYzNoek9YVnZiMmMyTUhOME1sVXdhV3cxVHpscFIxQldSV3RtUWpsdVdFeGxORWR3V2xCbFJFeHFZazh4UlVaYWNXRk1UbEJTY2pGTklpd2lSM0poYm5SVWVYQmxJam9pWTJ4cFpXNTBYMk55WldSbGJuUnBZV3h6SW4wPSc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY29va2llU3RvcmFnZTogQ29va2llU2VydmljZVxuICApIHt9XG5cbiAgaW5pdGlhbGl6ZUFwcChxdWVyeTogYW55ID0gdGhpcy5xdWVyeSkge1xuICAgIGNvbnN0IGFwcFBhcmFtcyA9IHF1ZXJ5WydwYXJhbXMnXTtcbiAgICBpZiAoIWFwcFBhcmFtcykge1xuICAgICAgY29uc3QgZXJyb3IgPSB7XG4gICAgICAgIHRpdGxlOiAnQXBwIFBhcmFtcyBNaXNzaW5nJyxcbiAgICAgICAgbWVzc2FnZTogJ1BsZWFzZSBnbyBiYWNrIHRvIHRoZSBhZG1pbiBhcHAnLFxuICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgfTtcbiAgICAgIHJldHVybiBlcnJvcjtcbiAgICB9XG4gICAgY29uc3Qgcm9sZSA9IHF1ZXJ5Wydyb2xlJ107XG5cbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KCdhcHBQYXJhbXMnLCBhcHBQYXJhbXMpO1xuICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoJ3JvbGUnLCByb2xlKTtcbiAgICByZXR1cm4gdGhpcy5hcHBJbml0KCk7XG4gIH1cblxuICBwcml2YXRlIGFwcEluaXQoKSB7XG4gICAgdGhpcy5odHRwLnBvc3Q8QXBwUGFyYW1zPihgJHt0aGlzLmJhc2VVcmx9L2F1dGgvZ2V0LXRva2VuYCwge30pLnN1YnNjcmliZSh7XG4gICAgICBuZXh0OiAocmVzKSA9PiB7XG4gICAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zZXR1cEFwcChyZXMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVycm9yID0ge1xuICAgICAgICAgIHRpdGxlOiAnQXBwIFBhcmFtcyBNaXNzaW5nJyxcbiAgICAgICAgICBtZXNzYWdlOiAnUGxlYXNlIGdvIGJhY2sgdG8gdGhlIGFkbWluIGFwcCcsXG4gICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IGVycm9yID0ge1xuICAgICAgICAgIHRpdGxlOiAnQXBwIFBhcmFtcyBNaXNzaW5nJyxcbiAgICAgICAgICBtZXNzYWdlOiBgU29tZXRoaW5nIHdlbnQgd3JvbmcsIFBsZWFzZSByZWZyZXNoIHRoZSBhcHBgLFxuICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHNldHVwQXBwKGRhdGE6IEFwcFBhcmFtcykge1xuICAgIHRoaXMuYXBwSXNTZXR1cCA9IHRydWU7XG4gICAgdGhpcy5jb29raWVTdG9yYWdlLnJlbW92ZSgnYXBwUGFyYW1zJyk7XG4gICAgdGhpcy5jb29raWVTdG9yYWdlLnNldChcbiAgICAgICdyZWRpcmVjdFVybCcsXG4gICAgICBkYXRhLmNsaWVudC5yZWRpcmVjdFVyaSxcbiAgICAgIGRhdGEuZXhwaXJlc0luXG4gICAgKTtcbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KCdhY2Nlc3NUb2tlbicsIGRhdGEuYWNjZXNzVG9rZW4sIGRhdGEuZXhwaXJlc0luKTtcbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KCd0b2tlblR5cGUnLCBkYXRhLnRva2VuVHlwZSwgZGF0YS5leHBpcmVzSW4pO1xuICAgIHJldHVybiB7XG4gICAgICB0aXRsZTogJ1N1Y2Nlc3MnLFxuICAgICAgbWVzc2FnZTogJ0l0ZW1zIHNhdmVkIHRvIGNvb2tpZXMgc3RvcmFnZScsXG4gICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgfTtcbiAgfVxufVxuIl19