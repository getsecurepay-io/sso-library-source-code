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
                }
                else {
                    const errorMessage = res['description'];
                    this.loginSubject.error(errorMessage);
                    this.loginSubject.complete();
                }
            },
            error: (err) => {
                // scrollTo({ top: 0 });
                this.loginSubject.error(err['description']);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktbGlicmFyeS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbXktbGlicmFyeS9zcmMvbGliL215LWxpYnJhcnkuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBYyxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUcvRCxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBQzNDLDZEQUE2RDtBQUs3RCxNQUFNLE9BQU8sZ0JBQWdCO0lBa0IzQixZQUNVLElBQWdCLEVBQ1AsYUFBNEI7UUFEckMsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUNQLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBbkIvQyxZQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ0wsa0JBQWEsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQzlCLGlCQUFZLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUM3QixvQkFBZSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDaEMsdUJBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNuQyxtQkFBYyxHQUFHLElBQUksT0FBTyxFQUFXLENBQUM7UUFDeEMsdUJBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNuQywwQkFBcUIsR0FBRyxJQUFJLE9BQU8sRUFBVyxDQUFDO1FBQy9DLHlCQUFvQixHQUFHLElBQUksT0FBTyxFQUFPLENBQUM7UUFHbEQseUJBQW9CLEdBQ2xCLDhLQUE4SyxDQUFDO1FBQ2pMLDRCQUF1QixHQUNyQix3SUFBd0ksQ0FBQztRQUMzSSwrQkFBMEIsR0FBRyxhQUFhLENBQUM7SUFLeEMsQ0FBQztJQUVKLHlCQUF5QixDQUFDLEtBQWE7UUFDckMsTUFBTSxPQUFPLEdBQUcseUNBQXlDLENBQUM7UUFDMUQsT0FBTyxPQUFP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LEVBQUU7Z0JBQ1osSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssNEJBQTRCLEVBQUU7b0JBQ2hELElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM5QixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN0QztxQkFBTTtvQkFDTCx3QkFBd0I7b0JBQ3hCLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztpQkFDOUM7WUFDSCxDQUFDO1lBQ0QsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ2Isd0JBQXdCO2dCQUN4QixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3JELENBQUM7U0FDRixDQUFDLENBQUM7UUFFTCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNsRCxDQUFDOytHQXZWVSxnQkFBZ0I7bUhBQWhCLGdCQUFnQixjQUZmLE1BQU07OzRGQUVQLGdCQUFnQjtrQkFINUIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IENvb2tpZVNlcnZpY2UgfSBmcm9tICcuL2Nvb2tpZS5zZXJ2aWNlJztcbmltcG9ydCB7IEFwcFBhcmFtcywgSHR0cFJlc3BvbnNlLCBMb2dpbkRhdGEgfSBmcm9tICcuL21vZGVsJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbi8vIGltcG9ydCB7IGVudmlyb25tZW50IH0gZnJvbSAnLi4vZW52aXJvbm1lbnRzL2Vudmlyb25tZW50JztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuZXhwb3J0IGNsYXNzIE15TGlicmFyeVNlcnZpY2Uge1xuICBiYXNlQVBJID0gJyc7XG4gIHByaXZhdGUgc2lnblVwU3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgbG9naW5TdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSBhcHBTZXR1cFN1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICBwcml2YXRlIHZlcmlmeUVtYWlsU3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgc2VuZE9UUFN1YmplY3QgPSBuZXcgU3ViamVjdDxib29sZWFuPigpO1xuICBwcml2YXRlIHZhbGlkYXRlT1RQU3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgZm9yZ290UGFzc3dvcmRTdWJqZWN0ID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcbiAgcHJpdmF0ZSByZXNldFBhc3N3b3JkU3ViamVjdCA9IG5ldyBTdWJqZWN0PGFueT4oKTtcbiAgcHJpdmF0ZSBxdWVyeU9iamVjdDogYW55O1xuXG4gIGVtYWlsVmFsaWRhdGlvblJlZ2V4ID1cbiAgICAvKFstISMtJyorLy05PT9BLVpeLX5dKyhcXC5bLSEjLScqKy8tOT0/QS1aXi1+XSspKnxcIihbXSEjLVteLX4gXFx0XXwoXFxcXFtcXHQgLX5dKSkrXCIpQFswLTlBLVphLXpdKFswLTlBLVphLXotXXswLDYxfVswLTlBLVphLXpdKT8oXFwuWzAtOUEtWmEtel0oWzAtOUEtWmEtei1dezAsNjF9WzAtOUEtWmEtel0pPykrLztcbiAgcGFzc3dvcmRWYWxpZGF0aW9uUmVnZXggPVxuICAgIC9eKD89LipbYS16XSkoPz0uKltBLVpdKSg/PS4qXFxkKSg/PS4qW2AhQCMkJV4mKigpXytcXC09XFxbXFxde307JzpcIlxcXFx8LC48PlxcLz9+XSlbQS1aYS16XFxkYCFAIyQlXiYqKClfK1xcLT1cXFtcXF17fTsnOlwiXFxcXHwsLjw+XFwvP35dezgsMTAwMDAwfSQvO1xuICBwaG9uZU51bWJlclZhbGlkYXRpb25SZWdleCA9IC9eMFxcZHs4LDEwfSQvO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvb2tpZVN0b3JhZ2U6IENvb2tpZVNlcnZpY2VcbiAgKSB7fVxuXG4gIGNoZWNrRm9yU3BlY2lhbENoYXJhY3RlcnMocXVlcnk6IHN0cmluZykge1xuICAgIGNvbnN0IHBhdHRlcm4gPSAvW2AhQCMkJV4mKigpXytcXC09XFxbXFxde307JzpcIlxcXFx8LC48PlxcLz9+XS87XG4gICAgcmV0dXJuIHBhdHRlcm4udGVzdChxdWVyeSk7XG4gIH1cblxuICBjaGVja0ZvckRpZ2l0cyhxdWVyeTogc3RyaW5nKSB7XG4gICAgY29uc3QgcGF0dGVybiA9IC9cXGQvO1xuICAgIHJldHVybiBwYXR0ZXJuLnRlc3QocXVlcnkpO1xuICB9XG5cbiAgY2hlY2tGb3JMb3dlcmNhc2UocXVlcnk6IHN0cmluZykge1xuICAgIGNvbnN0IHBhdHRlcm4gPSAvW2Etel0vO1xuICAgIHJldHVybiBwYXR0ZXJuLnRlc3QocXVlcnkpO1xuICB9XG5cbiAgY2hlY2tGb3JVcHBlcmNhc2UocXVlcnk6IHN0cmluZykge1xuICAgIGNvbnN0IHBhdHRlcm4gPSAvW0EtWl0vO1xuICAgIHJldHVybiBwYXR0ZXJuLnRlc3QocXVlcnkpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgaGVhZGVycygpOiBIdHRwSGVhZGVycyB7XG4gICAgbGV0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcbiAgICBjb25zdCBhY2Nlc3NUb2tlbiA9IHRoaXMuY29va2llU3RvcmFnZS5nZXQodGhpcy5jb29raWVTdG9yYWdlLkNPT0tJRV9OQU1FKTtcbiAgICBjb25zdCB0b2tlblR5cGUgPSB0aGlzLmNvb2tpZVN0b3JhZ2UuZ2V0KCd0b2tlblR5cGUnKTtcbiAgICBoZWFkZXJzID0gaGVhZGVycy5hcHBlbmQoJ0F1dGhvcml6YXRpb24nLCBgJHt0b2tlblR5cGV9ICR7YWNjZXNzVG9rZW59YCk7XG5cbiAgICByZXR1cm4gaGVhZGVycztcbiAgfVxuXG4gIGluaXRpYWxpemVBcHAocXVlcnk6IHsgcGFyYW1zOiBzdHJpbmc7IHVybDogc3RyaW5nIH0pOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IHF1ZXJ5T2JqZWN0ID0gcXVlcnk7XG4gICAgdGhpcy5xdWVyeU9iamVjdCA9IHF1ZXJ5T2JqZWN0O1xuICAgIGNvbnN0IGFwcFBhcmFtcyA9IHF1ZXJ5T2JqZWN0WydwYXJhbXMnXTtcbiAgICB0aGlzLmJhc2VBUEkgPSBxdWVyeU9iamVjdFsndXJsJ107XG4gICAgaWYgKCFhcHBQYXJhbXMpIHtcbiAgICAgIGNvbnN0IGVycm9yID0ge1xuICAgICAgICB0aXRsZTogJ0FwcCBQYXJhbXMgTWlzc2luZycsXG4gICAgICAgIG1lc3NhZ2U6ICdObyBhcHAgcGFyYW1zJyxcbiAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgcXVlcnlPYmplY3Q6IHRoaXMucXVlcnlPYmplY3QgfHwge30sXG4gICAgICB9O1xuICAgICAgdGhpcy5hcHBTZXR1cFN1YmplY3QuZXJyb3IoZXJyb3IpO1xuICAgICAgcmV0dXJuIHRoaXMuYXBwU2V0dXBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cbiAgICAvLyBjb25zdCByb2xlID0gcXVlcnlPYmplY3RbJ3JvbGUnXTtcbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KCdzc28nLCB0aGlzLmJhc2VBUEkpO1xuICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoJ2FwcFBhcmFtcycsIGFwcFBhcmFtcyk7XG4gICAgLy8gdGhpcy5jb29raWVTdG9yYWdlLnNldCgncm9sZScsIHJvbGUpO1xuICAgIHJldHVybiB0aGlzLmFwcEluaXQoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXBwSW5pdCgpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IGFjY2Vzc1Rva2VuID0gdGhpcy5jb29raWVTdG9yYWdlLmdldCgnYXBwUGFyYW1zJykgfHwgJyc7XG4gICAgbGV0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcbiAgICBoZWFkZXJzID0gaGVhZGVycy5hcHBlbmQoJ0Jhc2ljJywgYWNjZXNzVG9rZW4pO1xuXG4gICAgdGhpcy5odHRwXG4gICAgICAucG9zdDxBcHBQYXJhbXM+KGAke3RoaXMuYmFzZUFQSX0vYXV0aC9nZXQtdG9rZW5gLCB7fSwgeyBoZWFkZXJzIH0pXG4gICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogKHJlcykgPT4ge1xuICAgICAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dXBBcHAocmVzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSB7XG4gICAgICAgICAgICB0aXRsZTogJ05vIHJlcyBmcm9tIGFwaSBjYWxsJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdDaGVjayBiYWNrZW5kIGFwcCcsXG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgcXVlcnlPYmplY3Q6IHRoaXMucXVlcnlPYmplY3QgfHwge30sXG4gICAgICAgICAgfTtcbiAgICAgICAgICB0aGlzLmFwcFNldHVwU3ViamVjdC5lcnJvcihlcnJvcik7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSB7XG4gICAgICAgICAgICB0aXRsZTogJ0FwaSBFcnJvcicsXG4gICAgICAgICAgICBtZXNzYWdlOiBgU29tZXRoaW5nIHdlbnQgd3JvbmcsIFBsZWFzZSByZWZyZXNoIHRoZSBhcHBgLFxuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIHF1ZXJ5T2JqZWN0OiB0aGlzLnF1ZXJ5T2JqZWN0IHx8IHt9LFxuICAgICAgICAgIH07XG4gICAgICAgICAgdGhpcy5hcHBTZXR1cFN1YmplY3QuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5hcHBTZXR1cFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBwcml2YXRlIHNldHVwQXBwKGRhdGE6IEFwcFBhcmFtcykge1xuICAgIC8vIHRoaXMuYXBwSXNTZXR1cCA9IHRydWU7XG4gICAgdGhpcy5jb29raWVTdG9yYWdlLnJlbW92ZSgnYXBwUGFyYW1zJyk7XG4gICAgdGhpcy5jb29raWVTdG9yYWdlLnNldChcbiAgICAgICdyZWRpcmVjdFVybCcsXG4gICAgICBkYXRhLmNsaWVudC5yZWRpcmVjdFVyaSxcbiAgICAgIGRhdGEuZXhwaXJlc0luXG4gICAgKTtcbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KCdhY2Nlc3NUb2tlbicsIGRhdGEuYWNjZXNzVG9rZW4sIGRhdGEuZXhwaXJlc0luKTtcbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KCd0b2tlblR5cGUnLCBkYXRhLnRva2VuVHlwZSwgZGF0YS5leHBpcmVzSW4pO1xuICAgIHRoaXMuYXBwU2V0dXBTdWJqZWN0Lm5leHQoe1xuICAgICAgdGl0bGU6ICdTdWNjZXNzJyxcbiAgICAgIG1lc3NhZ2U6ICdJdGVtcyBzYXZlZCB0byBjb29raWVzIHN0b3JhZ2UnLFxuICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgcXVlcnlPYmplY3Q6IHRoaXMucXVlcnlPYmplY3QsXG4gICAgfSk7XG4gIH1cblxuICBsb2dpbihwYXlsb2FkOiB7IEVtYWlsQWRkcmVzczogc3RyaW5nOyBQYXNzd29yZDogc3RyaW5nIH0pIHtcbiAgICAvLyBUb2RvOiBoYW5kbGUgbG9naW5cbiAgICBjb25zdCBlbmNvZGVkRGF0YSA9IGJ0b2EoSlNPTi5zdHJpbmdpZnkocGF5bG9hZCkpO1xuICAgIGxldCBoZWFkZXJzID0gdGhpcy5oZWFkZXJzO1xuICAgIGhlYWRlcnMgPSBoZWFkZXJzLmFwcGVuZCgnQmFzaWMnLCBlbmNvZGVkRGF0YSk7XG5cbiAgICB0aGlzLmh0dHBcbiAgICAgIC5wb3N0PExvZ2luRGF0YT4oYCR7dGhpcy5iYXNlQVBJfS9hdXRoL2F1dGhlbnRpY2F0ZWAsIHt9LCB7IGhlYWRlcnMgfSlcbiAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICBuZXh0OiAocmVzOiBMb2dpbkRhdGEpID0+IHtcbiAgICAgICAgICBpZiAocmVzWyd1c2VySWQnXSkge1xuICAgICAgICAgICAgdGhpcy5zZXRVc2VyRGV0YWlscyhyZXMpO1xuICAgICAgICAgICAgY29uc3QgdXNlckRhdGEgPSByZXMgYXMgTG9naW5EYXRhO1xuICAgICAgICAgICAgdGhpcy5sb2dpblN1YmplY3QubmV4dCh1c2VyRGF0YSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlc1snZGVzY3JpcHRpb24nXTtcbiAgICAgICAgICAgIHRoaXMubG9naW5TdWJqZWN0LmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB0aGlzLmxvZ2luU3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICB0aGlzLmxvZ2luU3ViamVjdC5lcnJvcihlcnJbJ2Rlc2NyaXB0aW9uJ10pO1xuICAgICAgICAgIHRoaXMubG9naW5TdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLmxvZ2luU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIC8vIHNldFVzZXJEZXRhaWxzKGRhdGE6IExvZ2luRGF0YSkge1xuICBwcml2YXRlIHNldFVzZXJEZXRhaWxzKGRhdGE6IGFueSkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGRhdGEpIHtcbiAgICAgIGlmIChkYXRhW2tleV0pIHtcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2tleV0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgdGhpcy5jb29raWVTdG9yYWdlLnNldChrZXksIEpTT04uc3RyaW5naWZ5KGRhdGFba2V5XSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoa2V5LCBkYXRhW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2lnbnVwKHBheWxvYWQ6IGFueSkge1xuICAgIGxldCBoZWFkZXJzID0gdGhpcy5oZWFkZXJzO1xuICAgIHRoaXMuaHR0cFxuICAgICAgLnBvc3QoYCR7dGhpcy5iYXNlQVBJfS9hdXRoL3JlZ2lzdGVyYCwgcGF5bG9hZCwgeyBoZWFkZXJzIH0pXG4gICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgaWYgKHJlc1snZGF0YSddKSB7XG4gICAgICAgICAgICB0aGlzLnNpZ25VcFN1YmplY3QubmV4dChyZXMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSByZXNbJ2Rlc2NyaXB0aW9uJ107XG4gICAgICAgICAgICB0aGlzLnNpZ25VcFN1YmplY3QubmV4dChlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IChlcnI6IGFueSkgPT4ge1xuICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgIHRoaXMuc2lnblVwU3ViamVjdC5uZXh0KGVyclsnZGVzY3JpcHRpb24nXSk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLnNpZ25VcFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICB2ZXJpZnlFbWFpbChwYXlsb2FkOiB7IHRva2VuOiBzdHJpbmc7IHVzZXJJZDogc3RyaW5nIH0pIHtcbiAgICBsZXQgaGVhZGVycyA9IHRoaXMuaGVhZGVycztcblxuICAgIHRoaXMuaHR0cFxuICAgICAgLnBvc3QoYCR7dGhpcy5iYXNlQVBJfS9hdXRoL0NvbmZpcm0tRW1haWxgLCBwYXlsb2FkLCB7IGhlYWRlcnMgfSlcbiAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICBuZXh0OiAocmVzOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAocmVzWyd1c2VySWQnXSkge1xuICAgICAgICAgICAgdGhpcy52ZXJpZnlFbWFpbFN1YmplY3QubmV4dCh0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzWydkZXNjcmlwdGlvbiddO1xuICAgICAgICAgICAgdGhpcy5mb3Jnb3RQYXNzd29yZFN1YmplY3QubmV4dChlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICB0aGlzLmZvcmdvdFBhc3N3b3JkU3ViamVjdC5uZXh0KGVyclsnZGVzY3JpcHRpb24nXSk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLnZlcmlmeUVtYWlsU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIHNlbmRPVFAoT3RwVHlwZTogbnVtYmVyKSB7XG4gICAgbGV0IGhlYWRlcnMgPSB0aGlzLmhlYWRlcnM7XG4gICAgY29uc3QgdXNlcklkID0gdGhpcy5jb29raWVTdG9yYWdlLmdldCgndXNlcklkJyk7XG4gICAgaWYgKHVzZXJJZCkge1xuICAgICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgICAgT3RwVHlwZSxcbiAgICAgICAgdXNlcklkLFxuICAgICAgfTtcbiAgICAgIHRoaXMuaHR0cFxuICAgICAgICAucG9zdDxIdHRwUmVzcG9uc2U8c3RyaW5nPj4oYCR7dGhpcy5iYXNlQVBJfS9vdHAvc2VuZC1vdHBgLCBwYXlsb2FkLCB7XG4gICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgfSlcbiAgICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgICAgbmV4dDogKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICAgIGlmIChyZXNbJ3VzZXJJZCddKSB7XG4gICAgICAgICAgICAgIHRoaXMuc2VuZE9UUFN1YmplY3QubmV4dCh0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlc1snZGVzY3JpcHRpb24nXTtcbiAgICAgICAgICAgICAgdGhpcy5zZW5kT1RQU3ViamVjdC5uZXh0KGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgICB0aGlzLnNlbmRPVFBTdWJqZWN0Lm5leHQoZXJyWydkZXNjcmlwdGlvbiddKTtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgcmV0dXJuIHRoaXMuc2VuZE9UUFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuICAgIHRoaXMuc2VuZE9UUFN1YmplY3QubmV4dChmYWxzZSk7XG4gICAgcmV0dXJuIHRoaXMuc2VuZE9UUFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICB2YWxpZGF0ZU9UUCh0b2tlbjogc3RyaW5nKSB7XG4gICAgY29uc3QgdXNlcklkID0gdGhpcy5jb29raWVTdG9yYWdlLmdldCgndXNlcklkJyk7XG5cbiAgICBpZiAodXNlcklkKSB7XG4gICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICB0b2tlbixcbiAgICAgICAgdXNlcklkLFxuICAgICAgfTtcbiAgICAgIGxldCBoZWFkZXJzID0gdGhpcy5oZWFkZXJzO1xuICAgICAgdGhpcy5odHRwXG4gICAgICAgIC5wb3N0PExvZ2luRGF0YT4oYCR7dGhpcy5iYXNlQVBJfS9vdHAvdmFsaWRhdGUtb3RwYCwgcGF5bG9hZCwge1xuICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgIH0pXG4gICAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICAgIG5leHQ6IChyZXMpID0+IHtcbiAgICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgICAgaWYgKHJlc1sndG9rZW4nXSkge1xuICAgICAgICAgICAgICB0aGlzLnNldFVzZXJEZXRhaWxzKHJlcyk7XG4gICAgICAgICAgICAgIHRoaXMudmFsaWRhdGVPVFBTdWJqZWN0Lm5leHQocmVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlc1snZGVzY3JpcHRpb24nXTtcbiAgICAgICAgICAgICAgdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QubmV4dChlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QubmV4dChlcnJbJ2Rlc2NyaXB0aW9uJ10pO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuXG4gICAgdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QubmV4dChmYWxzZSk7XG4gICAgcmV0dXJuIHRoaXMudmFsaWRhdGVPVFBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgZm9yZ290UGFzc3dvcmQoZW1haWxBZGRyZXNzOiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgZW1haWxBZGRyZXNzLFxuICAgIH07XG4gICAgbGV0IGhlYWRlcnMgPSB0aGlzLmhlYWRlcnM7XG4gICAgdGhpcy5odHRwXG4gICAgICAucG9zdDxIdHRwUmVzcG9uc2U8TG9naW5EYXRhPj4oXG4gICAgICAgIGAke3RoaXMuYmFzZUFQSX0vYXV0aC9mb3Jnb3QtcGFzc3dvcmRgLFxuICAgICAgICBwYXlsb2FkLFxuICAgICAgICB7IGhlYWRlcnMgfVxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChyZXNbJ2RhdGEnXSkge1xuICAgICAgICAgICAgdGhpcy5zZXRVc2VyRGV0YWlscyhyZXMuZGF0YSk7XG4gICAgICAgICAgICB0aGlzLmZvcmdvdFBhc3N3b3JkU3ViamVjdC5uZXh0KHRydWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSByZXNbJ2Rlc2NyaXB0aW9uJ107XG4gICAgICAgICAgICB0aGlzLmZvcmdvdFBhc3N3b3JkU3ViamVjdC5uZXh0KGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0Lm5leHQoZXJyWydkZXNjcmlwdGlvbiddKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgcmVzZXRQYXNzd29yZChwYXlsb2FkOiB7XG4gICAgcGFzc3dvcmQ6IHN0cmluZztcbiAgICBjb25maXJtUGFzc3dvcmQ6IHN0cmluZztcbiAgICB1c2VySWQ6IHN0cmluZztcbiAgfSkge1xuICAgIGxldCBoZWFkZXJzID0gdGhpcy5oZWFkZXJzO1xuICAgIHRoaXMuaHR0cFxuICAgICAgLnBvc3Q8TG9naW5EYXRhPihgJHt0aGlzLmJhc2VBUEl9L2F1dGgvcmVzZXQtcGFzc3dvcmRgLCBwYXlsb2FkLCB7XG4gICAgICAgIGhlYWRlcnMsXG4gICAgICB9KVxuICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IChyZXMpID0+IHtcbiAgICAgICAgICBpZiAocmVzWydkYXRhJ10gPT09ICdQYXNzd29yZCByZXNldCBzdWNjZXNzZnVsLicpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VXNlckRldGFpbHMocmVzLmRhdGEpO1xuICAgICAgICAgICAgdGhpcy5yZXNldFBhc3N3b3JkU3ViamVjdC5uZXh0KHRydWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlc1snZGVzY3JpcHRpb24nXTtcbiAgICAgICAgICAgIHRoaXMucmVzZXRQYXNzd29yZFN1YmplY3QubmV4dChlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICB0aGlzLnJlc2V0UGFzc3dvcmRTdWJqZWN0Lm5leHQoZXJyWydkZXNjcmlwdGlvbiddKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMucmVzZXRQYXNzd29yZFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cbn1cbiJdfQ==