import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "./cookie.service";
// import { environment } from '../environments/environment';
export class MyLibraryService {
    constructor(http, cookieStorage) {
        this.http = http;
        this.cookieStorage = cookieStorage;
        this.baseAPI = '';
        this.signUpSubject = new Subject();
        this.loginSubject = new Subject();
        this.appSetupSubject = new Subject();
        this.verifyEmailSubject = new Subject();
        this.sendOTPSubject = new Subject();
        this.validateOTPSubject = new Subject();
        this.forgotPasswordSubject = new Subject();
        this.resetPasswordSubject = new Subject();
        this.emailValidationRegex = /([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)+/;
        this.passwordValidationRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])[A-Za-z\d`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]{8,100000}$/;
        this.phoneNumberValidationRegex = /^0\d{8,10}$/;
    }
    checkForSpecialCharacters(query) {
        const pattern = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return pattern.test(query);
    }
    checkForDigits(query) {
        const pattern = /\d/;
        return pattern.test(query);
    }
    checkForLowercase(query) {
        const pattern = /[a-z]/;
        return pattern.test(query);
    }
    checkForUppercase(query) {
        const pattern = /[A-Z]/;
        return pattern.test(query);
    }
    get headers() {
        let headers = new HttpHeaders();
        const accessToken = this.cookieStorage.get(this.cookieStorage.COOKIE_NAME);
        const tokenType = this.cookieStorage.get('tokenType');
        headers = headers.append('Authorization', `${tokenType} ${accessToken}`);
        return headers;
    }
    initializeApp(query) {
        const queryObject = query;
        this.queryObject = queryObject;
        const appParams = queryObject['params'];
        this.baseAPI = queryObject['url'];
        if (!appParams) {
            const error = {
                title: 'App Params Missing',
                message: 'No app params',
                type: 'error',
                queryObject: this.queryObject || {},
            };
            this.appSetupSubject.error(error);
            return this.appSetupSubject.asObservable();
        }
        // const role = queryObject['role'];
        this.cookieStorage.set('sso', this.baseAPI);
        this.cookieStorage.set('appParams', appParams);
        // this.cookieStorage.set('role', role);
        return this.appInit();
    }
    appInit() {
        const accessToken = this.cookieStorage.get('appParams') || '';
        let headers = new HttpHeaders();
        headers = headers.append('Basic', accessToken);
        this.http
            .post(`${this.baseAPI}/auth/get-token`, {}, { headers })
            .subscribe({
            next: (res) => {
                if (res) {
                    this.setupApp(res);
                }
                const error = {
                    title: 'No res from api call',
                    message: 'Check backend app',
                    type: 'error',
                    queryObject: this.queryObject || {},
                };
                this.appSetupSubject.error(error);
            },
            error: (err) => {
                const error = {
                    title: 'Api Error',
                    message: `Something went wrong, Please refresh the app`,
                    type: 'error',
                    queryObject: this.queryObject || {},
                };
                this.appSetupSubject.error(error);
            },
        });
        return this.appSetupSubject.asObservable();
    }
    setupApp(data) {
        // this.appIsSetup = true;
        this.cookieStorage.remove('appParams');
        this.cookieStorage.set('redirectUrl', data.client.redirectUri, data.expiresIn);
        this.cookieStorage.set('accessToken', data.accessToken, data.expiresIn);
        this.cookieStorage.set('tokenType', data.tokenType, data.expiresIn);
        this.appSetupSubject.next({
            title: 'Success',
            message: 'Items saved to cookies storage',
            type: 'success',
            queryObject: this.queryObject,
        });
    }
    login(payload) {
        console.log('Yeah, logging works:', payload);
        // Todo: handle login
        const encodedData = btoa(JSON.stringify(payload));
        let headers = this.headers;
        headers = headers.append('Basic', encodedData);
        this.http
            .post(`${this.baseAPI}/auth/authenticate`, {}, { headers })
            .subscribe({
            next: (res) => {
                if (res['userId']) {
                    this.setUserDetails(res);
                    const userData = res;
                    this.loginSubject.next(userData);
                    this.loginSubject.complete();
                }
                else {
                    const errorMessage = res['description'];
                    this.loginSubject.error(errorMessage);
                    console.log('Login error:', errorMessage);
                }
            },
            error: (err) => {
                console.log('Login error:', err);
                // scrollTo({ top: 0 });
                this.loginSubject.error(err);
                this.loginSubject.complete();
            },
        });
        return this.loginSubject.asObservable();
    }
    // setUserDetails(data: LoginData) {
    setUserDetails(data) {
        for (const key in data) {
            if (data[key]) {
                if (typeof data[key] === 'object') {
                    this.cookieStorage.set(key, JSON.stringify(data[key]));
                }
                else {
                    this.cookieStorage.set(key, data[key]);
                }
            }
        }
    }
    signup(payload) {
        let headers = this.headers;
        this.http
            .post(`${this.baseAPI}/auth/register`, payload, { headers })
            .subscribe({
            next: (res) => {
                if (res['data']) {
                    this.signUpSubject.next(res);
                }
                else {
                    const errorMessage = res['description'];
                    this.signUpSubject.next(errorMessage);
                }
            },
            error: (err) => {
                // scrollTo({ top: 0 });
                this.signUpSubject.next(err['description']);
            },
        });
        return this.signUpSubject.asObservable();
    }
    verifyEmail(payload) {
        let headers = this.headers;
        this.http
            .post(`${this.baseAPI}/auth/Confirm-Email`, payload, { headers })
            .subscribe({
            next: (res) => {
                if (res['userId']) {
                    this.verifyEmailSubject.next(true);
                }
                else {
                    const errorMessage = res['description'];
                    this.forgotPasswordSubject.next(errorMessage);
                }
            },
            error: (err) => {
                // scrollTo({ top: 0 });
                this.forgotPasswordSubject.next(err['description']);
            },
        });
        return this.verifyEmailSubject.asObservable();
    }
    sendOTP(OtpType) {
        let headers = this.headers;
        const userId = this.cookieStorage.get('userId');
        if (userId) {
            const payload = {
                OtpType,
                userId,
            };
            this.http
                .post(`${this.baseAPI}/otp/send-otp`, payload, {
                headers,
            })
                .subscribe({
                next: (res) => {
                    // scrollTo({ top: 0 });
                    if (res['userId']) {
                        this.sendOTPSubject.next(true);
                    }
                    else {
                        const errorMessage = res['description'];
                        this.sendOTPSubject.next(errorMessage);
                    }
                },
                error: (err) => {
                    // scrollTo({ top: 0 });
                    this.sendOTPSubject.next(err['description']);
                },
            });
            return this.sendOTPSubject.asObservable();
        }
        this.sendOTPSubject.next(false);
        return this.sendOTPSubject.asObservable();
    }
    validateOTP(token) {
        const userId = this.cookieStorage.get('userId');
        if (userId) {
            const payload = {
                token,
                userId,
            };
            let headers = this.headers;
            this.http
                .post(`${this.baseAPI}/otp/validate-otp`, payload, {
                headers,
            })
                .subscribe({
                next: (res) => {
                    // scrollTo({ top: 0 });
                    if (res['token']) {
                        this.setUserDetails(res);
                        this.validateOTPSubject.next(res);
                    }
                    else {
                        const errorMessage = res['description'];
                        this.validateOTPSubject.next(errorMessage);
                    }
                },
                error: (err) => {
                    // scrollTo({ top: 0 });
                    this.validateOTPSubject.next(err['description']);
                },
            });
            return this.validateOTPSubject.asObservable();
        }
        this.validateOTPSubject.next(false);
        return this.validateOTPSubject.asObservable();
    }
    forgotPassword(emailAddress) {
        const payload = {
            emailAddress,
        };
        let headers = this.headers;
        this.http
            .post(`${this.baseAPI}/auth/forgot-password`, payload, { headers })
            .subscribe({
            next: (res) => {
                if (res['data']) {
                    this.setUserDetails(res.data);
                    this.forgotPasswordSubject.next(true);
                }
                else {
                    const errorMessage = res['description'];
                    this.forgotPasswordSubject.next(errorMessage);
                }
            },
            error: (err) => {
                // scrollTo({ top: 0 });
                this.forgotPasswordSubject.next(err['description']);
            },
        });
        return this.forgotPasswordSubject.asObservable();
    }
    resetPassword(payload) {
        let headers = this.headers;
        this.http
            .post(`${this.baseAPI}/auth/reset-password`, payload, {
            headers,
        })
            .subscribe({
            next: (res) => {
                if (res['data'] === 'Password reset successful.') {
                    this.setUserDetails(res.data);
                    this.resetPasswordSubject.next(true);
                }
                else {
                    // scrollTo({ top: 0 });
                    const errorMessage = res['description'];
                    this.resetPasswordSubject.next(errorMessage);
                }
            },
            error: (err) => {
                // scrollTo({ top: 0 });
                this.resetPasswordSubject.next(err['description']);
            },
        });
        return this.resetPasswordSubject.asObservable();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: MyLibraryService, deps: [{ token: i1.HttpClient }, { token: i2.CookieService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: MyLibraryService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: MyLibraryService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return [{ type: i1.HttpClient }, { type: i2.CookieService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktbGlicmFyeS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbXktbGlicmFyeS9zcmMvbGliL215LWxpYnJhcnkuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBYyxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUcvRCxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBQzNDLDZEQUE2RDtBQUs3RCxNQUFNLE9BQU8sZ0JBQWdCO0lBa0IzQixZQUNVLElBQWdCLEVBQ1AsYUFBNEI7UUFEckMsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUNQLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBbkIvQyxZQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ0wsa0JBQWEsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQzlCLGlCQUFZLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUM3QixvQkFBZSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDaEMsdUJBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNuQyxtQkFBYyxHQUFHLElBQUksT0FBTyxFQUFXLENBQUM7UUFDeEMsdUJBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNuQywwQkFBcUIsR0FBRyxJQUFJLE9BQU8sRUFBVyxDQUFDO1FBQy9DLHlCQUFvQixHQUFHLElBQUksT0FBTyxFQUFPLENBQUM7UUFHbEQseUJBQW9CLEdBQ2xCLDhLQUE4SyxDQUFDO1FBQ2pMLDRCQUF1QixHQUNyQix3SUFBd0ksQ0FBQztRQUMzSSwrQkFBMEIsR0FBRyxhQUFhLENBQUM7SUFLeEMsQ0FBQztJQUVKLHlCQUF5QixDQUFDLEtBQWE7UUFDckMsTUFBTSxPQUFPLEdBQUcseUNBQXlDLENBQUM7UUFDMUQsT0FBTyxPQUFP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QUMzQixJQUFJLENBQUMsSUFBSTthQUNOLElBQUksQ0FBWSxHQUFHLElBQUksQ0FBQyxPQUFPLHNCQUFzQixFQUFFLE9BQU8sRUFBRTtZQUMvRCxPQUFPO1NBQ1IsQ0FBQzthQUNELFNBQVMsQ0FBQztZQUNULElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNaLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLDRCQUE0QixFQUFFO29CQUNoRCxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDOUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDdEM7cUJBQU07b0JBQ0wsd0JBQXdCO29CQUN4QixNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ3hDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQzlDO1lBQ0gsQ0FBQztZQUNELEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNiLHdCQUF3QjtnQkFDeEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNyRCxDQUFDO1NBQ0YsQ0FBQyxDQUFDO1FBRUwsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDbEQsQ0FBQzsrR0EzVlUsZ0JBQWdCO21IQUFoQixnQkFBZ0IsY0FGZixNQUFNOzs0RkFFUCxnQkFBZ0I7a0JBSDVCLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBDb29raWVTZXJ2aWNlIH0gZnJvbSAnLi9jb29raWUuc2VydmljZSc7XG5pbXBvcnQgeyBBcHBQYXJhbXMsIEh0dHBSZXNwb25zZSwgTG9naW5EYXRhIH0gZnJvbSAnLi9tb2RlbCc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG4vLyBpbXBvcnQgeyBlbnZpcm9ubWVudCB9IGZyb20gJy4uL2Vudmlyb25tZW50cy9lbnZpcm9ubWVudCc7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxufSlcbmV4cG9ydCBjbGFzcyBNeUxpYnJhcnlTZXJ2aWNlIHtcbiAgYmFzZUFQSSA9ICcnO1xuICBwcml2YXRlIHNpZ25VcFN1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICBwcml2YXRlIGxvZ2luU3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgYXBwU2V0dXBTdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSB2ZXJpZnlFbWFpbFN1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICBwcml2YXRlIHNlbmRPVFBTdWJqZWN0ID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcbiAgcHJpdmF0ZSB2YWxpZGF0ZU9UUFN1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICBwcml2YXRlIGZvcmdvdFBhc3N3b3JkU3ViamVjdCA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XG4gIHByaXZhdGUgcmVzZXRQYXNzd29yZFN1YmplY3QgPSBuZXcgU3ViamVjdDxhbnk+KCk7XG4gIHByaXZhdGUgcXVlcnlPYmplY3Q6IGFueTtcblxuICBlbWFpbFZhbGlkYXRpb25SZWdleCA9XG4gICAgLyhbLSEjLScqKy8tOT0/QS1aXi1+XSsoXFwuWy0hIy0nKisvLTk9P0EtWl4tfl0rKSp8XCIoW10hIy1bXi1+IFxcdF18KFxcXFxbXFx0IC1+XSkpK1wiKUBbMC05QS1aYS16XShbMC05QS1aYS16LV17MCw2MX1bMC05QS1aYS16XSk/KFxcLlswLTlBLVphLXpdKFswLTlBLVphLXotXXswLDYxfVswLTlBLVphLXpdKT8pKy87XG4gIHBhc3N3b3JkVmFsaWRhdGlvblJlZ2V4ID1cbiAgICAvXig/PS4qW2Etel0pKD89LipbQS1aXSkoPz0uKlxcZCkoPz0uKltgIUAjJCVeJiooKV8rXFwtPVxcW1xcXXt9Oyc6XCJcXFxcfCwuPD5cXC8/fl0pW0EtWmEtelxcZGAhQCMkJV4mKigpXytcXC09XFxbXFxde307JzpcIlxcXFx8LC48PlxcLz9+XXs4LDEwMDAwMH0kLztcbiAgcGhvbmVOdW1iZXJWYWxpZGF0aW9uUmVnZXggPSAvXjBcXGR7OCwxMH0kLztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb29raWVTdG9yYWdlOiBDb29raWVTZXJ2aWNlXG4gICkge31cblxuICBjaGVja0ZvclNwZWNpYWxDaGFyYWN0ZXJzKHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gL1tgIUAjJCVeJiooKV8rXFwtPVxcW1xcXXt9Oyc6XCJcXFxcfCwuPD5cXC8/fl0vO1xuICAgIHJldHVybiBwYXR0ZXJuLnRlc3QocXVlcnkpO1xuICB9XG5cbiAgY2hlY2tGb3JEaWdpdHMocXVlcnk6IHN0cmluZykge1xuICAgIGNvbnN0IHBhdHRlcm4gPSAvXFxkLztcbiAgICByZXR1cm4gcGF0dGVybi50ZXN0KHF1ZXJ5KTtcbiAgfVxuXG4gIGNoZWNrRm9yTG93ZXJjYXNlKHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gL1thLXpdLztcbiAgICByZXR1cm4gcGF0dGVybi50ZXN0KHF1ZXJ5KTtcbiAgfVxuXG4gIGNoZWNrRm9yVXBwZXJjYXNlKHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gL1tBLVpdLztcbiAgICByZXR1cm4gcGF0dGVybi50ZXN0KHF1ZXJ5KTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGhlYWRlcnMoKTogSHR0cEhlYWRlcnMge1xuICAgIGxldCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKCk7XG4gICAgY29uc3QgYWNjZXNzVG9rZW4gPSB0aGlzLmNvb2tpZVN0b3JhZ2UuZ2V0KHRoaXMuY29va2llU3RvcmFnZS5DT09LSUVfTkFNRSk7XG4gICAgY29uc3QgdG9rZW5UeXBlID0gdGhpcy5jb29raWVTdG9yYWdlLmdldCgndG9rZW5UeXBlJyk7XG4gICAgaGVhZGVycyA9IGhlYWRlcnMuYXBwZW5kKCdBdXRob3JpemF0aW9uJywgYCR7dG9rZW5UeXBlfSAke2FjY2Vzc1Rva2VufWApO1xuXG4gICAgcmV0dXJuIGhlYWRlcnM7XG4gIH1cblxuICBpbml0aWFsaXplQXBwKHF1ZXJ5OiB7IHBhcmFtczogc3RyaW5nOyB1cmw6IHN0cmluZyB9KTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCBxdWVyeU9iamVjdCA9IHF1ZXJ5O1xuICAgIHRoaXMucXVlcnlPYmplY3QgPSBxdWVyeU9iamVjdDtcbiAgICBjb25zdCBhcHBQYXJhbXMgPSBxdWVyeU9iamVjdFsncGFyYW1zJ107XG4gICAgdGhpcy5iYXNlQVBJID0gcXVlcnlPYmplY3RbJ3VybCddO1xuICAgIGlmICghYXBwUGFyYW1zKSB7XG4gICAgICBjb25zdCBlcnJvciA9IHtcbiAgICAgICAgdGl0bGU6ICdBcHAgUGFyYW1zIE1pc3NpbmcnLFxuICAgICAgICBtZXNzYWdlOiAnTm8gYXBwIHBhcmFtcycsXG4gICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgIHF1ZXJ5T2JqZWN0OiB0aGlzLnF1ZXJ5T2JqZWN0IHx8IHt9LFxuICAgICAgfTtcbiAgICAgIHRoaXMuYXBwU2V0dXBTdWJqZWN0LmVycm9yKGVycm9yKTtcbiAgICAgIHJldHVybiB0aGlzLmFwcFNldHVwU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgICB9XG4gICAgLy8gY29uc3Qgcm9sZSA9IHF1ZXJ5T2JqZWN0Wydyb2xlJ107XG4gICAgdGhpcy5jb29raWVTdG9yYWdlLnNldCgnc3NvJywgdGhpcy5iYXNlQVBJKTtcbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KCdhcHBQYXJhbXMnLCBhcHBQYXJhbXMpO1xuICAgIC8vIHRoaXMuY29va2llU3RvcmFnZS5zZXQoJ3JvbGUnLCByb2xlKTtcbiAgICByZXR1cm4gdGhpcy5hcHBJbml0KCk7XG4gIH1cblxuICBwcml2YXRlIGFwcEluaXQoKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCBhY2Nlc3NUb2tlbiA9IHRoaXMuY29va2llU3RvcmFnZS5nZXQoJ2FwcFBhcmFtcycpIHx8ICcnO1xuICAgIGxldCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKCk7XG4gICAgaGVhZGVycyA9IGhlYWRlcnMuYXBwZW5kKCdCYXNpYycsIGFjY2Vzc1Rva2VuKTtcblxuICAgIHRoaXMuaHR0cFxuICAgICAgLnBvc3Q8QXBwUGFyYW1zPihgJHt0aGlzLmJhc2VBUEl9L2F1dGgvZ2V0LXRva2VuYCwge30sIHsgaGVhZGVycyB9KVxuICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IChyZXMpID0+IHtcbiAgICAgICAgICBpZiAocmVzKSB7XG4gICAgICAgICAgICB0aGlzLnNldHVwQXBwKHJlcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGVycm9yID0ge1xuICAgICAgICAgICAgdGl0bGU6ICdObyByZXMgZnJvbSBhcGkgY2FsbCcsXG4gICAgICAgICAgICBtZXNzYWdlOiAnQ2hlY2sgYmFja2VuZCBhcHAnLFxuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIHF1ZXJ5T2JqZWN0OiB0aGlzLnF1ZXJ5T2JqZWN0IHx8IHt9LFxuICAgICAgICAgIH07XG4gICAgICAgICAgdGhpcy5hcHBTZXR1cFN1YmplY3QuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgIGNvbnN0IGVycm9yID0ge1xuICAgICAgICAgICAgdGl0bGU6ICdBcGkgRXJyb3InLFxuICAgICAgICAgICAgbWVzc2FnZTogYFNvbWV0aGluZyB3ZW50IHdyb25nLCBQbGVhc2UgcmVmcmVzaCB0aGUgYXBwYCxcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICBxdWVyeU9iamVjdDogdGhpcy5xdWVyeU9iamVjdCB8fCB7fSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMuYXBwU2V0dXBTdWJqZWN0LmVycm9yKGVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuYXBwU2V0dXBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXR1cEFwcChkYXRhOiBBcHBQYXJhbXMpIHtcbiAgICAvLyB0aGlzLmFwcElzU2V0dXAgPSB0cnVlO1xuICAgIHRoaXMuY29va2llU3RvcmFnZS5yZW1vdmUoJ2FwcFBhcmFtcycpO1xuICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoXG4gICAgICAncmVkaXJlY3RVcmwnLFxuICAgICAgZGF0YS5jbGllbnQucmVkaXJlY3RVcmksXG4gICAgICBkYXRhLmV4cGlyZXNJblxuICAgICk7XG4gICAgdGhpcy5jb29raWVTdG9yYWdlLnNldCgnYWNjZXNzVG9rZW4nLCBkYXRhLmFjY2Vzc1Rva2VuLCBkYXRhLmV4cGlyZXNJbik7XG4gICAgdGhpcy5jb29raWVTdG9yYWdlLnNldCgndG9rZW5UeXBlJywgZGF0YS50b2tlblR5cGUsIGRhdGEuZXhwaXJlc0luKTtcbiAgICB0aGlzLmFwcFNldHVwU3ViamVjdC5uZXh0KHtcbiAgICAgIHRpdGxlOiAnU3VjY2VzcycsXG4gICAgICBtZXNzYWdlOiAnSXRlbXMgc2F2ZWQgdG8gY29va2llcyBzdG9yYWdlJyxcbiAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgIHF1ZXJ5T2JqZWN0OiB0aGlzLnF1ZXJ5T2JqZWN0LFxuICAgIH0pO1xuICB9XG5cbiAgbG9naW4ocGF5bG9hZDogeyBFbWFpbEFkZHJlc3M6IHN0cmluZzsgUGFzc3dvcmQ6IHN0cmluZyB9KSB7XG4gICAgY29uc29sZS5sb2coJ1llYWgsIGxvZ2dpbmcgd29ya3M6JywgcGF5bG9hZCk7XG5cbiAgICAvLyBUb2RvOiBoYW5kbGUgbG9naW5cbiAgICBjb25zdCBlbmNvZGVkRGF0YSA9IGJ0b2EoSlNPTi5zdHJpbmdpZnkocGF5bG9hZCkpO1xuICAgIGxldCBoZWFkZXJzID0gdGhpcy5oZWFkZXJzO1xuICAgIGhlYWRlcnMgPSBoZWFkZXJzLmFwcGVuZCgnQmFzaWMnLCBlbmNvZGVkRGF0YSk7XG5cbiAgICB0aGlzLmh0dHBcbiAgICAgIC5wb3N0PExvZ2luRGF0YT4oYCR7dGhpcy5iYXNlQVBJfS9hdXRoL2F1dGhlbnRpY2F0ZWAsIHt9LCB7IGhlYWRlcnMgfSlcbiAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICBuZXh0OiAocmVzOiBMb2dpbkRhdGEpID0+IHtcbiAgICAgICAgICBpZiAocmVzWyd1c2VySWQnXSkge1xuICAgICAgICAgICAgdGhpcy5zZXRVc2VyRGV0YWlscyhyZXMpO1xuICAgICAgICAgICAgY29uc3QgdXNlckRhdGEgPSByZXMgYXMgTG9naW5EYXRhO1xuICAgICAgICAgICAgdGhpcy5sb2dpblN1YmplY3QubmV4dCh1c2VyRGF0YSk7XG4gICAgICAgICAgICB0aGlzLmxvZ2luU3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSByZXNbJ2Rlc2NyaXB0aW9uJ107XG4gICAgICAgICAgICB0aGlzLmxvZ2luU3ViamVjdC5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0xvZ2luIGVycm9yOicsIGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdMb2dpbiBlcnJvcjonLCBlcnIpO1xuICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgIHRoaXMubG9naW5TdWJqZWN0LmVycm9yKGVycik7XG4gICAgICAgICAgdGhpcy5sb2dpblN1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMubG9naW5TdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgLy8gc2V0VXNlckRldGFpbHMoZGF0YTogTG9naW5EYXRhKSB7XG4gIHByaXZhdGUgc2V0VXNlckRldGFpbHMoZGF0YTogYW55KSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gZGF0YSkge1xuICAgICAgaWYgKGRhdGFba2V5XSkge1xuICAgICAgICBpZiAodHlwZW9mIGRhdGFba2V5XSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KGtleSwgSlNPTi5zdHJpbmdpZnkoZGF0YVtrZXldKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5jb29raWVTdG9yYWdlLnNldChrZXksIGRhdGFba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzaWdudXAocGF5bG9hZDogYW55KSB7XG4gICAgbGV0IGhlYWRlcnMgPSB0aGlzLmhlYWRlcnM7XG4gICAgdGhpcy5odHRwXG4gICAgICAucG9zdChgJHt0aGlzLmJhc2VBUEl9L2F1dGgvcmVnaXN0ZXJgLCBwYXlsb2FkLCB7IGhlYWRlcnMgfSlcbiAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICBuZXh0OiAocmVzOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAocmVzWydkYXRhJ10pIHtcbiAgICAgICAgICAgIHRoaXMuc2lnblVwU3ViamVjdC5uZXh0KHJlcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlc1snZGVzY3JpcHRpb24nXTtcbiAgICAgICAgICAgIHRoaXMuc2lnblVwU3ViamVjdC5uZXh0KGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKGVycjogYW55KSA9PiB7XG4gICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgdGhpcy5zaWduVXBTdWJqZWN0Lm5leHQoZXJyWydkZXNjcmlwdGlvbiddKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuc2lnblVwU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIHZlcmlmeUVtYWlsKHBheWxvYWQ6IHsgdG9rZW46IHN0cmluZzsgdXNlcklkOiBzdHJpbmcgfSkge1xuICAgIGxldCBoZWFkZXJzID0gdGhpcy5oZWFkZXJzO1xuXG4gICAgdGhpcy5odHRwXG4gICAgICAucG9zdChgJHt0aGlzLmJhc2VBUEl9L2F1dGgvQ29uZmlybS1FbWFpbGAsIHBheWxvYWQsIHsgaGVhZGVycyB9KVxuICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChyZXNbJ3VzZXJJZCddKSB7XG4gICAgICAgICAgICB0aGlzLnZlcmlmeUVtYWlsU3ViamVjdC5uZXh0KHRydWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSByZXNbJ2Rlc2NyaXB0aW9uJ107XG4gICAgICAgICAgICB0aGlzLmZvcmdvdFBhc3N3b3JkU3ViamVjdC5uZXh0KGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0Lm5leHQoZXJyWydkZXNjcmlwdGlvbiddKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMudmVyaWZ5RW1haWxTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgc2VuZE9UUChPdHBUeXBlOiBudW1iZXIpIHtcbiAgICBsZXQgaGVhZGVycyA9IHRoaXMuaGVhZGVycztcbiAgICBjb25zdCB1c2VySWQgPSB0aGlzLmNvb2tpZVN0b3JhZ2UuZ2V0KCd1c2VySWQnKTtcbiAgICBpZiAodXNlcklkKSB7XG4gICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICBPdHBUeXBlLFxuICAgICAgICB1c2VySWQsXG4gICAgICB9O1xuICAgICAgdGhpcy5odHRwXG4gICAgICAgIC5wb3N0PEh0dHBSZXNwb25zZTxzdHJpbmc+PihgJHt0aGlzLmJhc2VBUEl9L290cC9zZW5kLW90cGAsIHBheWxvYWQsIHtcbiAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICB9KVxuICAgICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgICBuZXh0OiAocmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgICAgaWYgKHJlc1sndXNlcklkJ10pIHtcbiAgICAgICAgICAgICAgdGhpcy5zZW5kT1RQU3ViamVjdC5uZXh0KHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzWydkZXNjcmlwdGlvbiddO1xuICAgICAgICAgICAgICB0aGlzLnNlbmRPVFBTdWJqZWN0Lm5leHQoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICAgIHRoaXMuc2VuZE9UUFN1YmplY3QubmV4dChlcnJbJ2Rlc2NyaXB0aW9uJ10pO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gdGhpcy5zZW5kT1RQU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgICB9XG4gICAgdGhpcy5zZW5kT1RQU3ViamVjdC5uZXh0KGZhbHNlKTtcbiAgICByZXR1cm4gdGhpcy5zZW5kT1RQU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIHZhbGlkYXRlT1RQKHRva2VuOiBzdHJpbmcpIHtcbiAgICBjb25zdCB1c2VySWQgPSB0aGlzLmNvb2tpZVN0b3JhZ2UuZ2V0KCd1c2VySWQnKTtcblxuICAgIGlmICh1c2VySWQpIHtcbiAgICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICAgIHRva2VuLFxuICAgICAgICB1c2VySWQsXG4gICAgICB9O1xuICAgICAgbGV0IGhlYWRlcnMgPSB0aGlzLmhlYWRlcnM7XG4gICAgICB0aGlzLmh0dHBcbiAgICAgICAgLnBvc3Q8TG9naW5EYXRhPihgJHt0aGlzLmJhc2VBUEl9L290cC92YWxpZGF0ZS1vdHBgLCBwYXlsb2FkLCB7XG4gICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgfSlcbiAgICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgICAgbmV4dDogKHJlcykgPT4ge1xuICAgICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgICBpZiAocmVzWyd0b2tlbiddKSB7XG4gICAgICAgICAgICAgIHRoaXMuc2V0VXNlckRldGFpbHMocmVzKTtcbiAgICAgICAgICAgICAgdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QubmV4dChyZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzWydkZXNjcmlwdGlvbiddO1xuICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRlT1RQU3ViamVjdC5uZXh0KGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlT1RQU3ViamVjdC5uZXh0KGVyclsnZGVzY3JpcHRpb24nXSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlT1RQU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLnZhbGlkYXRlT1RQU3ViamVjdC5uZXh0KGZhbHNlKTtcbiAgICByZXR1cm4gdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBmb3Jnb3RQYXNzd29yZChlbWFpbEFkZHJlc3M6IHN0cmluZykge1xuICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICBlbWFpbEFkZHJlc3MsXG4gICAgfTtcbiAgICBsZXQgaGVhZGVycyA9IHRoaXMuaGVhZGVycztcbiAgICB0aGlzLmh0dHBcbiAgICAgIC5wb3N0PEh0dHBSZXNwb25zZTxMb2dpbkRhdGE+PihcbiAgICAgICAgYCR7dGhpcy5iYXNlQVBJfS9hdXRoL2ZvcmdvdC1wYXNzd29yZGAsXG4gICAgICAgIHBheWxvYWQsXG4gICAgICAgIHsgaGVhZGVycyB9XG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgaWYgKHJlc1snZGF0YSddKSB7XG4gICAgICAgICAgICB0aGlzLnNldFVzZXJEZXRhaWxzKHJlcy5kYXRhKTtcbiAgICAgICAgICAgIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0Lm5leHQodHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlc1snZGVzY3JpcHRpb24nXTtcbiAgICAgICAgICAgIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0Lm5leHQoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgdGhpcy5mb3Jnb3RQYXNzd29yZFN1YmplY3QubmV4dChlcnJbJ2Rlc2NyaXB0aW9uJ10pO1xuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5mb3Jnb3RQYXNzd29yZFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICByZXNldFBhc3N3b3JkKHBheWxvYWQ6IHtcbiAgICBwYXNzd29yZDogc3RyaW5nO1xuICAgIGNvbmZpcm1QYXNzd29yZDogc3RyaW5nO1xuICAgIHVzZXJJZDogc3RyaW5nO1xuICB9KSB7XG4gICAgbGV0IGhlYWRlcnMgPSB0aGlzLmhlYWRlcnM7XG4gICAgdGhpcy5odHRwXG4gICAgICAucG9zdDxMb2dpbkRhdGE+KGAke3RoaXMuYmFzZUFQSX0vYXV0aC9yZXNldC1wYXNzd29yZGAsIHBheWxvYWQsIHtcbiAgICAgICAgaGVhZGVycyxcbiAgICAgIH0pXG4gICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogKHJlcykgPT4ge1xuICAgICAgICAgIGlmIChyZXNbJ2RhdGEnXSA9PT0gJ1Bhc3N3b3JkIHJlc2V0IHN1Y2Nlc3NmdWwuJykge1xuICAgICAgICAgICAgdGhpcy5zZXRVc2VyRGV0YWlscyhyZXMuZGF0YSk7XG4gICAgICAgICAgICB0aGlzLnJlc2V0UGFzc3dvcmRTdWJqZWN0Lm5leHQodHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzWydkZXNjcmlwdGlvbiddO1xuICAgICAgICAgICAgdGhpcy5yZXNldFBhc3N3b3JkU3ViamVjdC5uZXh0KGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgIHRoaXMucmVzZXRQYXNzd29yZFN1YmplY3QubmV4dChlcnJbJ2Rlc2NyaXB0aW9uJ10pO1xuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5yZXNldFBhc3N3b3JkU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxufVxuIl19