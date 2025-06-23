import * as i0 from '@angular/core';
import { Injectable } from '@angular/core';
import * as i1 from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

class CookieService {
    constructor() {
        this.COOKIE_NAME = 'accessToken';
    }
    set(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + days * 1000);
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/';
    }
    get(name) {
        var nameEQ = name + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ')
                c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0)
                return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    remove(name) {
        this.set(name, '', -10000000000);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: CookieService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: CookieService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: CookieService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }] });

class SecureAuthService {
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
                    this.loginSubject.complete();
                }
                else {
                    const errorMessage = res?.description || 'Login failed';
                    this.loginSubject.error(errorMessage);
                    console.log('Login error res:', errorMessage);
                }
            },
            error: (err) => {
                console.log('Login error err:', err);
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: SecureAuthService, deps: [{ token: i1.HttpClient }, { token: CookieService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: SecureAuthService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: SecureAuthService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return [{ type: i1.HttpClient }, { type: CookieService }]; } });

/*
 * Public API Surface of my-library
 */
// export * from './lib/sso-auth.service';
// export * from './lib/my-library.module';
// export * from './lib/interceptors/token.interceptor';

/**
 * Generated bundle index. Do not edit.
 */

export { SecureAuthService };
//# sourceMappingURL=sso-library.mjs.map
