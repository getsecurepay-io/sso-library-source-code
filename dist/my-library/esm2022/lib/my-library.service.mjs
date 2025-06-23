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
                    const errorMessage = res?.description || 'Login failed';
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
                    const errorMessage = res?.description || 'Failed';
                    this.signUpSubject.next(errorMessage);
                }
            },
            error: (err) => {
                // scrollTo({ top: 0 });
                this.signUpSubject.next(err?.description || 'Failed');
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
                    const errorMessage = res?.description || 'Failed';
                    this.forgotPasswordSubject.next(errorMessage);
                }
            },
            error: (err) => {
                // scrollTo({ top: 0 });
                this.forgotPasswordSubject.next(err?.description || 'Failed');
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
                        const errorMessage = res?.description || 'Failed';
                        this.sendOTPSubject.next(errorMessage);
                    }
                },
                error: (err) => {
                    // scrollTo({ top: 0 });
                    this.sendOTPSubject.next(err?.description || 'Failed');
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
                        const errorMessage = res?.description || 'Failed';
                        this.validateOTPSubject.next(errorMessage);
                    }
                },
                error: (err) => {
                    // scrollTo({ top: 0 });
                    this.validateOTPSubject.next(err?.description || 'Failed');
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
                    const errorMessage = res?.description || 'Failed';
                    this.forgotPasswordSubject.next(errorMessage);
                }
            },
            error: (err) => {
                // scrollTo({ top: 0 });
                this.forgotPasswordSubject.next(err?.description || 'Failed');
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
                    const errorMessage = res?.description || 'Failed';
                    this.resetPasswordSubject.next(errorMessage);
                }
            },
            error: (err) => {
                // scrollTo({ top: 0 });
                this.resetPasswordSubject.next(err?.description || 'Failed');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktbGlicmFyeS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbXktbGlicmFyeS9zcmMvbGliL215LWxpYnJhcnkuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBYyxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUcvRCxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBQzNDLDZEQUE2RDtBQUs3RCxNQUFNLE9BQU8sZ0JBQWdCO0lBa0IzQixZQUNVLElBQWdCLEVBQ1AsYUFBNEI7UUFEckMsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUNQLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBbkIvQyxZQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ0wsa0JBQWEsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQzlCLGlCQUFZLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUM3QixvQkFBZSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDaEMsdUJBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNuQyxtQkFBYyxHQUFHLElBQUksT0FBTyxFQUFXLENBQUM7UUFDeEMsdUJBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNuQywwQkFBcUIsR0FBRyxJQUFJLE9BQU8sRUFBVyxDQUFDO1FBQy9DLHlCQUFvQixHQUFHLElBQUksT0FBTyxFQUFPLENBQUM7UUFHbEQseUJBQW9CLEdBQ2xCLDhLQUE4SyxDQUFDO1FBQ2pMLDRCQUF1QixHQUNyQix3SUFBd0ksQ0FBQztRQUMzSSwrQkFBMEIsR0FBRyxhQUFhLENBQUM7SUFLeEMsQ0FBQztJQUVKLHlCQUF5QixDQUFDLEtBQWE7UUFDckMsTUFBTSxPQUFPLEdBQUcseUNBQXlDLENBQUM7UUFDMUQsT0FBTyxPQUFP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QUFhLENBQUMsT0FJYjtRQUNDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDM0IsSUFBSSxDQUFDLElBQUk7YUFDTixJQUFJLENBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxzQkFBc0IsRUFBRSxPQUFPLEVBQUU7WUFDL0QsT0FBTztTQUNSLENBQUM7YUFDRCxTQUFTLENBQUM7WUFDVCxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDWixJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyw0QkFBNEIsRUFBRTtvQkFDaEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzlCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3RDO3FCQUFNO29CQUNMLHdCQUF3QjtvQkFDeEIsTUFBTSxZQUFZLEdBQUcsR0FBRyxFQUFFLFdBQVcsSUFBSSxRQUFRLENBQUM7b0JBQ2xELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQzlDO1lBQ0gsQ0FBQztZQUNELEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNiLHdCQUF3QjtnQkFDeEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsV0FBVyxJQUFJLFFBQVEsQ0FBQyxDQUFDO1lBQy9ELENBQUM7U0FDRixDQUFDLENBQUM7UUFFTCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNsRCxDQUFDOytHQTNWVSxnQkFBZ0I7bUhBQWhCLGdCQUFnQixjQUZmLE1BQU07OzRGQUVQLGdCQUFnQjtrQkFINUIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IENvb2tpZVNlcnZpY2UgfSBmcm9tICcuL2Nvb2tpZS5zZXJ2aWNlJztcbmltcG9ydCB7IEFwcFBhcmFtcywgSHR0cFJlc3BvbnNlLCBMb2dpbkRhdGEgfSBmcm9tICcuL21vZGVsJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbi8vIGltcG9ydCB7IGVudmlyb25tZW50IH0gZnJvbSAnLi4vZW52aXJvbm1lbnRzL2Vudmlyb25tZW50JztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuZXhwb3J0IGNsYXNzIE15TGlicmFyeVNlcnZpY2Uge1xuICBiYXNlQVBJID0gJyc7XG4gIHByaXZhdGUgc2lnblVwU3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgbG9naW5TdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSBhcHBTZXR1cFN1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICBwcml2YXRlIHZlcmlmeUVtYWlsU3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgc2VuZE9UUFN1YmplY3QgPSBuZXcgU3ViamVjdDxib29sZWFuPigpO1xuICBwcml2YXRlIHZhbGlkYXRlT1RQU3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgZm9yZ290UGFzc3dvcmRTdWJqZWN0ID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcbiAgcHJpdmF0ZSByZXNldFBhc3N3b3JkU3ViamVjdCA9IG5ldyBTdWJqZWN0PGFueT4oKTtcbiAgcHJpdmF0ZSBxdWVyeU9iamVjdDogYW55O1xuXG4gIGVtYWlsVmFsaWRhdGlvblJlZ2V4ID1cbiAgICAvKFstISMtJyorLy05PT9BLVpeLX5dKyhcXC5bLSEjLScqKy8tOT0/QS1aXi1+XSspKnxcIihbXSEjLVteLX4gXFx0XXwoXFxcXFtcXHQgLX5dKSkrXCIpQFswLTlBLVphLXpdKFswLTlBLVphLXotXXswLDYxfVswLTlBLVphLXpdKT8oXFwuWzAtOUEtWmEtel0oWzAtOUEtWmEtei1dezAsNjF9WzAtOUEtWmEtel0pPykrLztcbiAgcGFzc3dvcmRWYWxpZGF0aW9uUmVnZXggPVxuICAgIC9eKD89LipbYS16XSkoPz0uKltBLVpdKSg/PS4qXFxkKSg/PS4qW2AhQCMkJV4mKigpXytcXC09XFxbXFxde307JzpcIlxcXFx8LC48PlxcLz9+XSlbQS1aYS16XFxkYCFAIyQlXiYqKClfK1xcLT1cXFtcXF17fTsnOlwiXFxcXHwsLjw+XFwvP35dezgsMTAwMDAwfSQvO1xuICBwaG9uZU51bWJlclZhbGlkYXRpb25SZWdleCA9IC9eMFxcZHs4LDEwfSQvO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvb2tpZVN0b3JhZ2U6IENvb2tpZVNlcnZpY2VcbiAgKSB7fVxuXG4gIGNoZWNrRm9yU3BlY2lhbENoYXJhY3RlcnMocXVlcnk6IHN0cmluZykge1xuICAgIGNvbnN0IHBhdHRlcm4gPSAvW2AhQCMkJV4mKigpXytcXC09XFxbXFxde307JzpcIlxcXFx8LC48PlxcLz9+XS87XG4gICAgcmV0dXJuIHBhdHRlcm4udGVzdChxdWVyeSk7XG4gIH1cblxuICBjaGVja0ZvckRpZ2l0cyhxdWVyeTogc3RyaW5nKSB7XG4gICAgY29uc3QgcGF0dGVybiA9IC9cXGQvO1xuICAgIHJldHVybiBwYXR0ZXJuLnRlc3QocXVlcnkpO1xuICB9XG5cbiAgY2hlY2tGb3JMb3dlcmNhc2UocXVlcnk6IHN0cmluZykge1xuICAgIGNvbnN0IHBhdHRlcm4gPSAvW2Etel0vO1xuICAgIHJldHVybiBwYXR0ZXJuLnRlc3QocXVlcnkpO1xuICB9XG5cbiAgY2hlY2tGb3JVcHBlcmNhc2UocXVlcnk6IHN0cmluZykge1xuICAgIGNvbnN0IHBhdHRlcm4gPSAvW0EtWl0vO1xuICAgIHJldHVybiBwYXR0ZXJuLnRlc3QocXVlcnkpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgaGVhZGVycygpOiBIdHRwSGVhZGVycyB7XG4gICAgbGV0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcbiAgICBjb25zdCBhY2Nlc3NUb2tlbiA9IHRoaXMuY29va2llU3RvcmFnZS5nZXQodGhpcy5jb29raWVTdG9yYWdlLkNPT0tJRV9OQU1FKTtcbiAgICBjb25zdCB0b2tlblR5cGUgPSB0aGlzLmNvb2tpZVN0b3JhZ2UuZ2V0KCd0b2tlblR5cGUnKTtcbiAgICBoZWFkZXJzID0gaGVhZGVycy5hcHBlbmQoJ0F1dGhvcml6YXRpb24nLCBgJHt0b2tlblR5cGV9ICR7YWNjZXNzVG9rZW59YCk7XG5cbiAgICByZXR1cm4gaGVhZGVycztcbiAgfVxuXG4gIGluaXRpYWxpemVBcHAocXVlcnk6IHsgcGFyYW1zOiBzdHJpbmc7IHVybDogc3RyaW5nIH0pOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IHF1ZXJ5T2JqZWN0ID0gcXVlcnk7XG4gICAgdGhpcy5xdWVyeU9iamVjdCA9IHF1ZXJ5T2JqZWN0O1xuICAgIGNvbnN0IGFwcFBhcmFtcyA9IHF1ZXJ5T2JqZWN0WydwYXJhbXMnXTtcbiAgICB0aGlzLmJhc2VBUEkgPSBxdWVyeU9iamVjdFsndXJsJ107XG4gICAgaWYgKCFhcHBQYXJhbXMpIHtcbiAgICAgIGNvbnN0IGVycm9yID0ge1xuICAgICAgICB0aXRsZTogJ0FwcCBQYXJhbXMgTWlzc2luZycsXG4gICAgICAgIG1lc3NhZ2U6ICdObyBhcHAgcGFyYW1zJyxcbiAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgcXVlcnlPYmplY3Q6IHRoaXMucXVlcnlPYmplY3QgfHwge30sXG4gICAgICB9O1xuICAgICAgdGhpcy5hcHBTZXR1cFN1YmplY3QuZXJyb3IoZXJyb3IpO1xuICAgICAgcmV0dXJuIHRoaXMuYXBwU2V0dXBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cbiAgICAvLyBjb25zdCByb2xlID0gcXVlcnlPYmplY3RbJ3JvbGUnXTtcbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KCdzc28nLCB0aGlzLmJhc2VBUEkpO1xuICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoJ2FwcFBhcmFtcycsIGFwcFBhcmFtcyk7XG4gICAgLy8gdGhpcy5jb29raWVTdG9yYWdlLnNldCgncm9sZScsIHJvbGUpO1xuICAgIHJldHVybiB0aGlzLmFwcEluaXQoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXBwSW5pdCgpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IGFjY2Vzc1Rva2VuID0gdGhpcy5jb29raWVTdG9yYWdlLmdldCgnYXBwUGFyYW1zJykgfHwgJyc7XG4gICAgbGV0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcbiAgICBoZWFkZXJzID0gaGVhZGVycy5hcHBlbmQoJ0Jhc2ljJywgYWNjZXNzVG9rZW4pO1xuXG4gICAgdGhpcy5odHRwXG4gICAgICAucG9zdDxBcHBQYXJhbXM+KGAke3RoaXMuYmFzZUFQSX0vYXV0aC9nZXQtdG9rZW5gLCB7fSwgeyBoZWFkZXJzIH0pXG4gICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogKHJlcykgPT4ge1xuICAgICAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dXBBcHAocmVzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSB7XG4gICAgICAgICAgICB0aXRsZTogJ05vIHJlcyBmcm9tIGFwaSBjYWxsJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdDaGVjayBiYWNrZW5kIGFwcCcsXG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgcXVlcnlPYmplY3Q6IHRoaXMucXVlcnlPYmplY3QgfHwge30sXG4gICAgICAgICAgfTtcbiAgICAgICAgICB0aGlzLmFwcFNldHVwU3ViamVjdC5lcnJvcihlcnJvcik7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSB7XG4gICAgICAgICAgICB0aXRsZTogJ0FwaSBFcnJvcicsXG4gICAgICAgICAgICBtZXNzYWdlOiBgU29tZXRoaW5nIHdlbnQgd3JvbmcsIFBsZWFzZSByZWZyZXNoIHRoZSBhcHBgLFxuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIHF1ZXJ5T2JqZWN0OiB0aGlzLnF1ZXJ5T2JqZWN0IHx8IHt9LFxuICAgICAgICAgIH07XG4gICAgICAgICAgdGhpcy5hcHBTZXR1cFN1YmplY3QuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5hcHBTZXR1cFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBwcml2YXRlIHNldHVwQXBwKGRhdGE6IEFwcFBhcmFtcykge1xuICAgIC8vIHRoaXMuYXBwSXNTZXR1cCA9IHRydWU7XG4gICAgdGhpcy5jb29raWVTdG9yYWdlLnJlbW92ZSgnYXBwUGFyYW1zJyk7XG4gICAgdGhpcy5jb29raWVTdG9yYWdlLnNldChcbiAgICAgICdyZWRpcmVjdFVybCcsXG4gICAgICBkYXRhLmNsaWVudC5yZWRpcmVjdFVyaSxcbiAgICAgIGRhdGEuZXhwaXJlc0luXG4gICAgKTtcbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KCdhY2Nlc3NUb2tlbicsIGRhdGEuYWNjZXNzVG9rZW4sIGRhdGEuZXhwaXJlc0luKTtcbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KCd0b2tlblR5cGUnLCBkYXRhLnRva2VuVHlwZSwgZGF0YS5leHBpcmVzSW4pO1xuICAgIHRoaXMuYXBwU2V0dXBTdWJqZWN0Lm5leHQoe1xuICAgICAgdGl0bGU6ICdTdWNjZXNzJyxcbiAgICAgIG1lc3NhZ2U6ICdJdGVtcyBzYXZlZCB0byBjb29raWVzIHN0b3JhZ2UnLFxuICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgcXVlcnlPYmplY3Q6IHRoaXMucXVlcnlPYmplY3QsXG4gICAgfSk7XG4gIH1cblxuICBsb2dpbihwYXlsb2FkOiB7IEVtYWlsQWRkcmVzczogc3RyaW5nOyBQYXNzd29yZDogc3RyaW5nIH0pIHtcbiAgICBjb25zb2xlLmxvZygnWWVhaCwgbG9nZ2luZyB3b3JrczonLCBwYXlsb2FkKTtcblxuICAgIC8vIFRvZG86IGhhbmRsZSBsb2dpblxuICAgIGNvbnN0IGVuY29kZWREYXRhID0gYnRvYShKU09OLnN0cmluZ2lmeShwYXlsb2FkKSk7XG4gICAgbGV0IGhlYWRlcnMgPSB0aGlzLmhlYWRlcnM7XG4gICAgaGVhZGVycyA9IGhlYWRlcnMuYXBwZW5kKCdCYXNpYycsIGVuY29kZWREYXRhKTtcblxuICAgIHRoaXMuaHR0cFxuICAgICAgLnBvc3Q8TG9naW5EYXRhPihgJHt0aGlzLmJhc2VBUEl9L2F1dGgvYXV0aGVudGljYXRlYCwge30sIHsgaGVhZGVycyB9KVxuICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IChyZXM6IExvZ2luRGF0YSkgPT4ge1xuICAgICAgICAgIGlmIChyZXNbJ3VzZXJJZCddKSB7XG4gICAgICAgICAgICB0aGlzLnNldFVzZXJEZXRhaWxzKHJlcyk7XG4gICAgICAgICAgICBjb25zdCB1c2VyRGF0YSA9IHJlcyBhcyBMb2dpbkRhdGE7XG4gICAgICAgICAgICB0aGlzLmxvZ2luU3ViamVjdC5uZXh0KHVzZXJEYXRhKTtcbiAgICAgICAgICAgIHRoaXMubG9naW5TdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlcz8uZGVzY3JpcHRpb24gfHwgJ0xvZ2luIGZhaWxlZCc7XG4gICAgICAgICAgICB0aGlzLmxvZ2luU3ViamVjdC5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0xvZ2luIGVycm9yOicsIGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdMb2dpbiBlcnJvcjonLCBlcnIpO1xuICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgIHRoaXMubG9naW5TdWJqZWN0LmVycm9yKGVycik7XG4gICAgICAgICAgdGhpcy5sb2dpblN1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMubG9naW5TdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgLy8gc2V0VXNlckRldGFpbHMoZGF0YTogTG9naW5EYXRhKSB7XG4gIHByaXZhdGUgc2V0VXNlckRldGFpbHMoZGF0YTogYW55KSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gZGF0YSkge1xuICAgICAgaWYgKGRhdGFba2V5XSkge1xuICAgICAgICBpZiAodHlwZW9mIGRhdGFba2V5XSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KGtleSwgSlNPTi5zdHJpbmdpZnkoZGF0YVtrZXldKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5jb29raWVTdG9yYWdlLnNldChrZXksIGRhdGFba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzaWdudXAocGF5bG9hZDogYW55KSB7XG4gICAgbGV0IGhlYWRlcnMgPSB0aGlzLmhlYWRlcnM7XG4gICAgdGhpcy5odHRwXG4gICAgICAucG9zdChgJHt0aGlzLmJhc2VBUEl9L2F1dGgvcmVnaXN0ZXJgLCBwYXlsb2FkLCB7IGhlYWRlcnMgfSlcbiAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICBuZXh0OiAocmVzOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAocmVzWydkYXRhJ10pIHtcbiAgICAgICAgICAgIHRoaXMuc2lnblVwU3ViamVjdC5uZXh0KHJlcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlcz8uZGVzY3JpcHRpb24gfHwgJ0ZhaWxlZCc7XG4gICAgICAgICAgICB0aGlzLnNpZ25VcFN1YmplY3QubmV4dChlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IChlcnI6IGFueSkgPT4ge1xuICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgIHRoaXMuc2lnblVwU3ViamVjdC5uZXh0KGVycj8uZGVzY3JpcHRpb24gfHwgJ0ZhaWxlZCcpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5zaWduVXBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgdmVyaWZ5RW1haWwocGF5bG9hZDogeyB0b2tlbjogc3RyaW5nOyB1c2VySWQ6IHN0cmluZyB9KSB7XG4gICAgbGV0IGhlYWRlcnMgPSB0aGlzLmhlYWRlcnM7XG5cbiAgICB0aGlzLmh0dHBcbiAgICAgIC5wb3N0KGAke3RoaXMuYmFzZUFQSX0vYXV0aC9Db25maXJtLUVtYWlsYCwgcGF5bG9hZCwgeyBoZWFkZXJzIH0pXG4gICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgaWYgKHJlc1sndXNlcklkJ10pIHtcbiAgICAgICAgICAgIHRoaXMudmVyaWZ5RW1haWxTdWJqZWN0Lm5leHQodHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlcz8uZGVzY3JpcHRpb24gfHwgJ0ZhaWxlZCc7XG4gICAgICAgICAgICB0aGlzLmZvcmdvdFBhc3N3b3JkU3ViamVjdC5uZXh0KGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0Lm5leHQoZXJyPy5kZXNjcmlwdGlvbiB8fCAnRmFpbGVkJyk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLnZlcmlmeUVtYWlsU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIHNlbmRPVFAoT3RwVHlwZTogbnVtYmVyKSB7XG4gICAgbGV0IGhlYWRlcnMgPSB0aGlzLmhlYWRlcnM7XG4gICAgY29uc3QgdXNlcklkID0gdGhpcy5jb29raWVTdG9yYWdlLmdldCgndXNlcklkJyk7XG4gICAgaWYgKHVzZXJJZCkge1xuICAgICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgICAgT3RwVHlwZSxcbiAgICAgICAgdXNlcklkLFxuICAgICAgfTtcbiAgICAgIHRoaXMuaHR0cFxuICAgICAgICAucG9zdDxIdHRwUmVzcG9uc2U8c3RyaW5nPj4oYCR7dGhpcy5iYXNlQVBJfS9vdHAvc2VuZC1vdHBgLCBwYXlsb2FkLCB7XG4gICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgfSlcbiAgICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgICAgbmV4dDogKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICAgIGlmIChyZXNbJ3VzZXJJZCddKSB7XG4gICAgICAgICAgICAgIHRoaXMuc2VuZE9UUFN1YmplY3QubmV4dCh0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlcz8uZGVzY3JpcHRpb24gfHwgJ0ZhaWxlZCc7XG4gICAgICAgICAgICAgIHRoaXMuc2VuZE9UUFN1YmplY3QubmV4dChlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgICAgdGhpcy5zZW5kT1RQU3ViamVjdC5uZXh0KGVycj8uZGVzY3JpcHRpb24gfHwgJ0ZhaWxlZCcpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gdGhpcy5zZW5kT1RQU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgICB9XG4gICAgdGhpcy5zZW5kT1RQU3ViamVjdC5uZXh0KGZhbHNlKTtcbiAgICByZXR1cm4gdGhpcy5zZW5kT1RQU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIHZhbGlkYXRlT1RQKHRva2VuOiBzdHJpbmcpIHtcbiAgICBjb25zdCB1c2VySWQgPSB0aGlzLmNvb2tpZVN0b3JhZ2UuZ2V0KCd1c2VySWQnKTtcblxuICAgIGlmICh1c2VySWQpIHtcbiAgICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICAgIHRva2VuLFxuICAgICAgICB1c2VySWQsXG4gICAgICB9O1xuICAgICAgbGV0IGhlYWRlcnMgPSB0aGlzLmhlYWRlcnM7XG4gICAgICB0aGlzLmh0dHBcbiAgICAgICAgLnBvc3Q8TG9naW5EYXRhPihgJHt0aGlzLmJhc2VBUEl9L290cC92YWxpZGF0ZS1vdHBgLCBwYXlsb2FkLCB7XG4gICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgfSlcbiAgICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgICAgbmV4dDogKHJlcykgPT4ge1xuICAgICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgICBpZiAocmVzWyd0b2tlbiddKSB7XG4gICAgICAgICAgICAgIHRoaXMuc2V0VXNlckRldGFpbHMocmVzKTtcbiAgICAgICAgICAgICAgdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QubmV4dChyZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzPy5kZXNjcmlwdGlvbiB8fCAnRmFpbGVkJztcbiAgICAgICAgICAgICAgdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QubmV4dChlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QubmV4dChlcnI/LmRlc2NyaXB0aW9uIHx8ICdGYWlsZWQnKTtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGVPVFBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cblxuICAgIHRoaXMudmFsaWRhdGVPVFBTdWJqZWN0Lm5leHQoZmFsc2UpO1xuICAgIHJldHVybiB0aGlzLnZhbGlkYXRlT1RQU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIGZvcmdvdFBhc3N3b3JkKGVtYWlsQWRkcmVzczogc3RyaW5nKSB7XG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgIGVtYWlsQWRkcmVzcyxcbiAgICB9O1xuICAgIGxldCBoZWFkZXJzID0gdGhpcy5oZWFkZXJzO1xuICAgIHRoaXMuaHR0cFxuICAgICAgLnBvc3Q8SHR0cFJlc3BvbnNlPExvZ2luRGF0YT4+KFxuICAgICAgICBgJHt0aGlzLmJhc2VBUEl9L2F1dGgvZm9yZ290LXBhc3N3b3JkYCxcbiAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgeyBoZWFkZXJzIH1cbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICBuZXh0OiAocmVzOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAocmVzWydkYXRhJ10pIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VXNlckRldGFpbHMocmVzLmRhdGEpO1xuICAgICAgICAgICAgdGhpcy5mb3Jnb3RQYXNzd29yZFN1YmplY3QubmV4dCh0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzPy5kZXNjcmlwdGlvbiB8fCAnRmFpbGVkJztcbiAgICAgICAgICAgIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0Lm5leHQoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgdGhpcy5mb3Jnb3RQYXNzd29yZFN1YmplY3QubmV4dChlcnI/LmRlc2NyaXB0aW9uIHx8ICdGYWlsZWQnKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgcmVzZXRQYXNzd29yZChwYXlsb2FkOiB7XG4gICAgcGFzc3dvcmQ6IHN0cmluZztcbiAgICBjb25maXJtUGFzc3dvcmQ6IHN0cmluZztcbiAgICB1c2VySWQ6IHN0cmluZztcbiAgfSkge1xuICAgIGxldCBoZWFkZXJzID0gdGhpcy5oZWFkZXJzO1xuICAgIHRoaXMuaHR0cFxuICAgICAgLnBvc3Q8TG9naW5EYXRhPihgJHt0aGlzLmJhc2VBUEl9L2F1dGgvcmVzZXQtcGFzc3dvcmRgLCBwYXlsb2FkLCB7XG4gICAgICAgIGhlYWRlcnMsXG4gICAgICB9KVxuICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IChyZXMpID0+IHtcbiAgICAgICAgICBpZiAocmVzWydkYXRhJ10gPT09ICdQYXNzd29yZCByZXNldCBzdWNjZXNzZnVsLicpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VXNlckRldGFpbHMocmVzLmRhdGEpO1xuICAgICAgICAgICAgdGhpcy5yZXNldFBhc3N3b3JkU3ViamVjdC5uZXh0KHRydWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlcz8uZGVzY3JpcHRpb24gfHwgJ0ZhaWxlZCc7XG4gICAgICAgICAgICB0aGlzLnJlc2V0UGFzc3dvcmRTdWJqZWN0Lm5leHQoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgdGhpcy5yZXNldFBhc3N3b3JkU3ViamVjdC5uZXh0KGVycj8uZGVzY3JpcHRpb24gfHwgJ0ZhaWxlZCcpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5yZXNldFBhc3N3b3JkU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxufVxuIl19