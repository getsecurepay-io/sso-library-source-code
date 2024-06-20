import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "./cookie.service";
export class MyLibraryService {
    constructor(http, cookieStorage) {
        this.http = http;
        this.cookieStorage = cookieStorage;
        this.baseAPI = 'https://secureauth.secureid-digital.com.ng/api';
        // private baseAPI = environment.baseAPI;
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
    initializeApp(query) {
        const queryObject = query;
        this.queryObject = queryObject;
        const appParams = queryObject['params'];
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
        const role = queryObject['role'];
        this.cookieStorage.set('appParams', appParams);
        this.cookieStorage.set('role', role);
        return this.appInit();
    }
    appInit() {
        this.http.post(`${this.baseAPI}/auth/get-token`, {}).subscribe({
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
        let headers = new HttpHeaders();
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
                    this.loginSubject.next(errorMessage);
                }
            },
            error: (err) => {
                // scrollTo({ top: 0 });
                this.loginSubject.next(err['description']);
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
        this.http.post(`${this.baseAPI}/auth/register`, payload).subscribe({
            next: (res) => {
                if (res['data']) {
                    this.signUpSubject.next(true);
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
        this.http.post(`${this.baseAPI}/auth/Confirm-Email`, payload).subscribe({
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
        const userId = this.cookieStorage.get('userId');
        if (userId) {
            const payload = {
                OtpType,
                userId,
            };
            this.http
                .post(`${this.baseAPI}/otp/send-otp`, payload)
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
            this.http
                .post(`${this.baseAPI}/otp/validate-otp`, payload)
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
        this.http
            .post(`${this.baseAPI}/auth/forgot-password`, payload)
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
        this.http
            .post(`${this.baseAPI}/auth/reset-password`, payload)
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
    get redirectURL() {
        return this.cookieStorage.get('redirectUrl');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktbGlicmFyeS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbXktbGlicmFyeS9zcmMvbGliL215LWxpYnJhcnkuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBYyxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUcvRCxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBTTNDLE1BQU0sT0FBTyxnQkFBZ0I7SUFpQjNCLFlBQ1UsSUFBZ0IsRUFDUCxhQUE0QjtRQURyQyxTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ1Asa0JBQWEsR0FBYixhQUFhLENBQWU7UUFsQnZDLFlBQU8sR0FBRyxnREFBZ0QsQ0FBQztRQUNuRSx5Q0FBeUM7UUFDakMsa0JBQWEsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQzlCLGlCQUFZLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUM3QixvQkFBZSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDaEMsdUJBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNuQyxtQkFBYyxHQUFHLElBQUksT0FBTyxFQUFXLENBQUM7UUFDeEMsdUJBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNuQywwQkFBcUIsR0FBRyxJQUFJLE9BQU8sRUFBVyxDQUFDO1FBQy9DLHlCQUFvQixHQUFHLElBQUksT0FBTyxFQUFPLENBQUM7UUFHbEQseUJBQW9CLEdBQUcsOEtBQThLLENBQUE7UUFDck0sNEJBQXVCLEdBQUcsd0lBQXdJLENBQUE7UUFDbEssK0JBQTBCLEdBQUcsYUFBYSxDQUFBO0lBS3ZDLENBQUM7SUFFSix5QkFBeUIsQ0FBQyxLQUFhO1FBQ3JDLE1BQU0sT0FBTyxHQUFHLHlDQUF5QyxDQUFDO1FBQzFELE9BQU8sT0FB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LElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3RDO3FCQUFNO29CQUNMLHdCQUF3QjtvQkFDeEIsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUN4QyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2lCQUM5QztZQUNILENBQUM7WUFDRCxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDYix3QkFBd0I7Z0JBQ3hCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDckQsQ0FBQztTQUNGLENBQUMsQ0FBQztRQUVMLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ2xELENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDYixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQy9DLENBQUM7K0dBblRVLGdCQUFnQjttSEFBaEIsZ0JBQWdCLGNBRmYsTUFBTTs7NEZBRVAsZ0JBQWdCO2tCQUg1QixVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEh0dHBDbGllbnQsIEh0dHBIZWFkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgQ29va2llU2VydmljZSB9IGZyb20gJy4vY29va2llLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXBwUGFyYW1zLCBIdHRwUmVzcG9uc2UsIExvZ2luRGF0YSB9IGZyb20gJy4vbW9kZWwnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZW52aXJvbm1lbnQgfSBmcm9tICcuLi9lbnZpcm9ubWVudHMvZW52aXJvbm1lbnQnO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290Jyxcbn0pXG5leHBvcnQgY2xhc3MgTXlMaWJyYXJ5U2VydmljZSB7XG4gIHByaXZhdGUgYmFzZUFQSSA9ICdodHRwczovL3NlY3VyZWF1dGguc2VjdXJlaWQtZGlnaXRhbC5jb20ubmcvYXBpJztcbiAgLy8gcHJpdmF0ZSBiYXNlQVBJID0gZW52aXJvbm1lbnQuYmFzZUFQSTtcbiAgcHJpdmF0ZSBzaWduVXBTdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSBsb2dpblN1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICBwcml2YXRlIGFwcFNldHVwU3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgdmVyaWZ5RW1haWxTdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSBzZW5kT1RQU3ViamVjdCA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XG4gIHByaXZhdGUgdmFsaWRhdGVPVFBTdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSBmb3Jnb3RQYXNzd29yZFN1YmplY3QgPSBuZXcgU3ViamVjdDxib29sZWFuPigpO1xuICBwcml2YXRlIHJlc2V0UGFzc3dvcmRTdWJqZWN0ID0gbmV3IFN1YmplY3Q8YW55PigpO1xuICBwcml2YXRlIHF1ZXJ5T2JqZWN0OiBhbnk7XG5cbiAgZW1haWxWYWxpZGF0aW9uUmVnZXggPSAvKFstISMtJyorLy05PT9BLVpeLX5dKyhcXC5bLSEjLScqKy8tOT0/QS1aXi1+XSspKnxcIihbXSEjLVteLX4gXFx0XXwoXFxcXFtcXHQgLX5dKSkrXCIpQFswLTlBLVphLXpdKFswLTlBLVphLXotXXswLDYxfVswLTlBLVphLXpdKT8oXFwuWzAtOUEtWmEtel0oWzAtOUEtWmEtei1dezAsNjF9WzAtOUEtWmEtel0pPykrL1xuICBwYXNzd29yZFZhbGlkYXRpb25SZWdleCA9IC9eKD89LipbYS16XSkoPz0uKltBLVpdKSg/PS4qXFxkKSg/PS4qW2AhQCMkJV4mKigpXytcXC09XFxbXFxde307JzpcIlxcXFx8LC48PlxcLz9+XSlbQS1aYS16XFxkYCFAIyQlXiYqKClfK1xcLT1cXFtcXF17fTsnOlwiXFxcXHwsLjw+XFwvP35dezgsMTAwMDAwfSQvXG4gIHBob25lTnVtYmVyVmFsaWRhdGlvblJlZ2V4ID0gL14wXFxkezgsMTB9JC9cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb29raWVTdG9yYWdlOiBDb29raWVTZXJ2aWNlXG4gICkge31cblxuICBjaGVja0ZvclNwZWNpYWxDaGFyYWN0ZXJzKHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gL1tgIUAjJCVeJiooKV8rXFwtPVxcW1xcXXt9Oyc6XCJcXFxcfCwuPD5cXC8/fl0vO1xuICAgIHJldHVybiBwYXR0ZXJuLnRlc3QocXVlcnkpXG4gIH1cbiAgY2hlY2tGb3JEaWdpdHMocXVlcnk6IHN0cmluZykge1xuICAgIGNvbnN0IHBhdHRlcm4gPSAvXFxkLztcbiAgICByZXR1cm4gcGF0dGVybi50ZXN0KHF1ZXJ5KVxuICB9XG4gIGNoZWNrRm9yTG93ZXJjYXNlKHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gL1thLXpdLztcbiAgICByZXR1cm4gcGF0dGVybi50ZXN0KHF1ZXJ5KVxuICB9XG4gIGNoZWNrRm9yVXBwZXJjYXNlKHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gL1tBLVpdLztcbiAgICByZXR1cm4gcGF0dGVybi50ZXN0KHF1ZXJ5KVxuICB9XG5cbiAgaW5pdGlhbGl6ZUFwcChxdWVyeTogYW55KTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCBxdWVyeU9iamVjdCA9IHF1ZXJ5O1xuICAgIHRoaXMucXVlcnlPYmplY3QgPSBxdWVyeU9iamVjdDtcbiAgICBjb25zdCBhcHBQYXJhbXMgPSBxdWVyeU9iamVjdFsncGFyYW1zJ107XG4gICAgaWYgKCFhcHBQYXJhbXMpIHtcbiAgICAgIGNvbnN0IGVycm9yID0ge1xuICAgICAgICB0aXRsZTogJ0FwcCBQYXJhbXMgTWlzc2luZycsXG4gICAgICAgIG1lc3NhZ2U6ICdObyBhcHAgcGFyYW1zJyxcbiAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgcXVlcnlPYmplY3Q6IHRoaXMucXVlcnlPYmplY3QgfHwge30sXG4gICAgICB9O1xuICAgICAgdGhpcy5hcHBTZXR1cFN1YmplY3QuZXJyb3IoZXJyb3IpO1xuICAgICAgcmV0dXJuIHRoaXMuYXBwU2V0dXBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cbiAgICBjb25zdCByb2xlID0gcXVlcnlPYmplY3RbJ3JvbGUnXTtcbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KCdhcHBQYXJhbXMnLCBhcHBQYXJhbXMpO1xuICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoJ3JvbGUnLCByb2xlKTtcbiAgICByZXR1cm4gdGhpcy5hcHBJbml0KCk7XG4gIH1cblxuICBwcml2YXRlIGFwcEluaXQoKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICB0aGlzLmh0dHAucG9zdDxBcHBQYXJhbXM+KGAke3RoaXMuYmFzZUFQSX0vYXV0aC9nZXQtdG9rZW5gLCB7fSkuc3Vic2NyaWJlKHtcbiAgICAgIG5leHQ6IChyZXMpID0+IHtcbiAgICAgICAgaWYgKHJlcykge1xuICAgICAgICAgIHRoaXMuc2V0dXBBcHAocmVzKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlcnJvciA9IHtcbiAgICAgICAgICB0aXRsZTogJ05vIHJlcyBmcm9tIGFwaSBjYWxsJyxcbiAgICAgICAgICBtZXNzYWdlOiAnQ2hlY2sgYmFja2VuZCBhcHAnLFxuICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgcXVlcnlPYmplY3Q6IHRoaXMucXVlcnlPYmplY3QgfHwge30sXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYXBwU2V0dXBTdWJqZWN0LmVycm9yKGVycm9yKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICBjb25zdCBlcnJvciA9IHtcbiAgICAgICAgICB0aXRsZTogJ0FwaSBFcnJvcicsXG4gICAgICAgICAgbWVzc2FnZTogYFNvbWV0aGluZyB3ZW50IHdyb25nLCBQbGVhc2UgcmVmcmVzaCB0aGUgYXBwYCxcbiAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgIHF1ZXJ5T2JqZWN0OiB0aGlzLnF1ZXJ5T2JqZWN0IHx8IHt9LFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFwcFNldHVwU3ViamVjdC5lcnJvcihlcnJvcik7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuYXBwU2V0dXBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXR1cEFwcChkYXRhOiBBcHBQYXJhbXMpIHtcbiAgICAvLyB0aGlzLmFwcElzU2V0dXAgPSB0cnVlO1xuICAgIHRoaXMuY29va2llU3RvcmFnZS5yZW1vdmUoJ2FwcFBhcmFtcycpO1xuICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoXG4gICAgICAncmVkaXJlY3RVcmwnLFxuICAgICAgZGF0YS5jbGllbnQucmVkaXJlY3RVcmksXG4gICAgICBkYXRhLmV4cGlyZXNJblxuICAgICk7XG4gICAgdGhpcy5jb29raWVTdG9yYWdlLnNldCgnYWNjZXNzVG9rZW4nLCBkYXRhLmFjY2Vzc1Rva2VuLCBkYXRhLmV4cGlyZXNJbik7XG4gICAgdGhpcy5jb29raWVTdG9yYWdlLnNldCgndG9rZW5UeXBlJywgZGF0YS50b2tlblR5cGUsIGRhdGEuZXhwaXJlc0luKTtcbiAgICB0aGlzLmFwcFNldHVwU3ViamVjdC5uZXh0KHtcbiAgICAgIHRpdGxlOiAnU3VjY2VzcycsXG4gICAgICBtZXNzYWdlOiAnSXRlbXMgc2F2ZWQgdG8gY29va2llcyBzdG9yYWdlJyxcbiAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgIHF1ZXJ5T2JqZWN0OiB0aGlzLnF1ZXJ5T2JqZWN0LFxuICAgIH0pO1xuICB9XG5cbiAgbG9naW4ocGF5bG9hZDogeyBFbWFpbEFkZHJlc3M6IHN0cmluZzsgUGFzc3dvcmQ6IHN0cmluZyB9KSB7XG4gICAgLy8gVG9kbzogaGFuZGxlIGxvZ2luXG4gICAgY29uc3QgZW5jb2RlZERhdGEgPSBidG9hKEpTT04uc3RyaW5naWZ5KHBheWxvYWQpKTtcblxuICAgIGxldCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKCk7XG4gICAgaGVhZGVycyA9IGhlYWRlcnMuYXBwZW5kKCdCYXNpYycsIGVuY29kZWREYXRhKTtcblxuICAgIHRoaXMuaHR0cFxuICAgICAgLnBvc3Q8TG9naW5EYXRhPihgJHt0aGlzLmJhc2VBUEl9L2F1dGgvYXV0aGVudGljYXRlYCwge30sIHsgaGVhZGVycyB9KVxuICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IChyZXM6IExvZ2luRGF0YSkgPT4ge1xuICAgICAgICAgIGlmIChyZXNbJ3VzZXJJZCddKSB7XG4gICAgICAgICAgICB0aGlzLnNldFVzZXJEZXRhaWxzKHJlcyk7XG4gICAgICAgICAgICBjb25zdCB1c2VyRGF0YSA9ICAocmVzIGFzIExvZ2luRGF0YSlcbiAgICAgICAgICAgIHRoaXMubG9naW5TdWJqZWN0Lm5leHQodXNlckRhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSByZXNbJ2Rlc2NyaXB0aW9uJ107XG4gICAgICAgICAgICB0aGlzLmxvZ2luU3ViamVjdC5uZXh0KGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgIHRoaXMubG9naW5TdWJqZWN0Lm5leHQoZXJyWydkZXNjcmlwdGlvbiddKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMubG9naW5TdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgLy8gc2V0VXNlckRldGFpbHMoZGF0YTogTG9naW5EYXRhKSB7XG4gIHByaXZhdGUgc2V0VXNlckRldGFpbHMoZGF0YTogYW55KSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gZGF0YSkge1xuICAgICAgaWYgKGRhdGFba2V5XSkge1xuICAgICAgICBpZiAodHlwZW9mIGRhdGFba2V5XSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KGtleSwgSlNPTi5zdHJpbmdpZnkoZGF0YVtrZXldKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5jb29raWVTdG9yYWdlLnNldChrZXksIGRhdGFba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzaWdudXAocGF5bG9hZDogYW55KSB7XG4gICAgdGhpcy5odHRwLnBvc3QoYCR7dGhpcy5iYXNlQVBJfS9hdXRoL3JlZ2lzdGVyYCwgcGF5bG9hZCkuc3Vic2NyaWJlKHtcbiAgICAgIG5leHQ6IChyZXM6IGFueSkgPT4ge1xuICAgICAgICBpZiAocmVzWydkYXRhJ10pIHtcbiAgICAgICAgICB0aGlzLnNpZ25VcFN1YmplY3QubmV4dCh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSByZXNbJ2Rlc2NyaXB0aW9uJ107XG4gICAgICAgICAgdGhpcy5zaWduVXBTdWJqZWN0Lm5leHQoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGVycm9yOiAoZXJyOiBhbnkpID0+IHtcbiAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgIHRoaXMuc2lnblVwU3ViamVjdC5uZXh0KGVyclsnZGVzY3JpcHRpb24nXSk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuc2lnblVwU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIHZlcmlmeUVtYWlsKHBheWxvYWQ6IHsgdG9rZW46IHN0cmluZzsgdXNlcklkOiBzdHJpbmcgfSkge1xuICAgIHRoaXMuaHR0cC5wb3N0KGAke3RoaXMuYmFzZUFQSX0vYXV0aC9Db25maXJtLUVtYWlsYCwgcGF5bG9hZCkuc3Vic2NyaWJlKHtcbiAgICAgIG5leHQ6IChyZXM6IGFueSkgPT4ge1xuICAgICAgICBpZiAocmVzWyd1c2VySWQnXSkge1xuICAgICAgICAgIHRoaXMudmVyaWZ5RW1haWxTdWJqZWN0Lm5leHQodHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzWydkZXNjcmlwdGlvbiddO1xuICAgICAgICAgIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0Lm5leHQoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICB0aGlzLmZvcmdvdFBhc3N3b3JkU3ViamVjdC5uZXh0KGVyclsnZGVzY3JpcHRpb24nXSk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMudmVyaWZ5RW1haWxTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgc2VuZE9UUChPdHBUeXBlOiBudW1iZXIpIHtcbiAgICBjb25zdCB1c2VySWQgPSB0aGlzLmNvb2tpZVN0b3JhZ2UuZ2V0KCd1c2VySWQnKTtcbiAgICBpZiAodXNlcklkKSB7XG4gICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICBPdHBUeXBlLFxuICAgICAgICB1c2VySWQsXG4gICAgICB9O1xuICAgICAgdGhpcy5odHRwXG4gICAgICAgIC5wb3N0PEh0dHBSZXNwb25zZTxzdHJpbmc+PihgJHt0aGlzLmJhc2VBUEl9L290cC9zZW5kLW90cGAsIHBheWxvYWQpXG4gICAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICAgIG5leHQ6IChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgICBpZiAocmVzWyd1c2VySWQnXSkge1xuICAgICAgICAgICAgICB0aGlzLnNlbmRPVFBTdWJqZWN0Lm5leHQodHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSByZXNbJ2Rlc2NyaXB0aW9uJ107XG4gICAgICAgICAgICAgIHRoaXMuc2VuZE9UUFN1YmplY3QubmV4dChlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgICAgdGhpcy5zZW5kT1RQU3ViamVjdC5uZXh0KGVyclsnZGVzY3JpcHRpb24nXSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB0aGlzLnNlbmRPVFBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cbiAgICB0aGlzLnNlbmRPVFBTdWJqZWN0Lm5leHQoZmFsc2UpO1xuICAgIHJldHVybiB0aGlzLnNlbmRPVFBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgdmFsaWRhdGVPVFAodG9rZW46IHN0cmluZykge1xuICAgIGNvbnN0IHVzZXJJZCA9IHRoaXMuY29va2llU3RvcmFnZS5nZXQoJ3VzZXJJZCcpO1xuXG4gICAgaWYgKHVzZXJJZCkge1xuICAgICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgICAgdG9rZW4sXG4gICAgICAgIHVzZXJJZCxcbiAgICAgIH07XG4gICAgICB0aGlzLmh0dHBcbiAgICAgICAgLnBvc3Q8TG9naW5EYXRhPihgJHt0aGlzLmJhc2VBUEl9L290cC92YWxpZGF0ZS1vdHBgLCBwYXlsb2FkKVxuICAgICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgICBuZXh0OiAocmVzKSA9PiB7XG4gICAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICAgIGlmIChyZXNbJ3Rva2VuJ10pIHtcbiAgICAgICAgICAgICAgdGhpcy5zZXRVc2VyRGV0YWlscyhyZXMpO1xuICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRlT1RQU3ViamVjdC5uZXh0KHJlcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSByZXNbJ2Rlc2NyaXB0aW9uJ107XG4gICAgICAgICAgICAgIHRoaXMudmFsaWRhdGVPVFBTdWJqZWN0Lm5leHQoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVPVFBTdWJqZWN0Lm5leHQoZXJyWydkZXNjcmlwdGlvbiddKTtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGVPVFBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cblxuICAgIHRoaXMudmFsaWRhdGVPVFBTdWJqZWN0Lm5leHQoZmFsc2UpO1xuICAgIHJldHVybiB0aGlzLnZhbGlkYXRlT1RQU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIGZvcmdvdFBhc3N3b3JkKGVtYWlsQWRkcmVzczogc3RyaW5nKSB7XG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgIGVtYWlsQWRkcmVzcyxcbiAgICB9O1xuICAgIHRoaXMuaHR0cFxuICAgICAgLnBvc3Q8SHR0cFJlc3BvbnNlPExvZ2luRGF0YT4+KFxuICAgICAgICBgJHt0aGlzLmJhc2VBUEl9L2F1dGgvZm9yZ290LXBhc3N3b3JkYCxcbiAgICAgICAgcGF5bG9hZFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChyZXNbJ2RhdGEnXSkge1xuICAgICAgICAgICAgdGhpcy5zZXRVc2VyRGV0YWlscyhyZXMuZGF0YSk7XG4gICAgICAgICAgICB0aGlzLmZvcmdvdFBhc3N3b3JkU3ViamVjdC5uZXh0KHRydWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSByZXNbJ2Rlc2NyaXB0aW9uJ107XG4gICAgICAgICAgICB0aGlzLmZvcmdvdFBhc3N3b3JkU3ViamVjdC5uZXh0KGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0Lm5leHQoZXJyWydkZXNjcmlwdGlvbiddKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgcmVzZXRQYXNzd29yZChwYXlsb2FkOiB7XG4gICAgcGFzc3dvcmQ6IHN0cmluZztcbiAgICBjb25maXJtUGFzc3dvcmQ6IHN0cmluZztcbiAgICB1c2VySWQ6IHN0cmluZztcbiAgfSkge1xuICAgIHRoaXMuaHR0cFxuICAgICAgLnBvc3Q8TG9naW5EYXRhPihgJHt0aGlzLmJhc2VBUEl9L2F1dGgvcmVzZXQtcGFzc3dvcmRgLCBwYXlsb2FkKVxuICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IChyZXMpID0+IHtcbiAgICAgICAgICBpZiAocmVzWydkYXRhJ10gPT09ICdQYXNzd29yZCByZXNldCBzdWNjZXNzZnVsLicpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VXNlckRldGFpbHMocmVzLmRhdGEpO1xuICAgICAgICAgICAgdGhpcy5yZXNldFBhc3N3b3JkU3ViamVjdC5uZXh0KHRydWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlc1snZGVzY3JpcHRpb24nXTtcbiAgICAgICAgICAgIHRoaXMucmVzZXRQYXNzd29yZFN1YmplY3QubmV4dChlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICB0aGlzLnJlc2V0UGFzc3dvcmRTdWJqZWN0Lm5leHQoZXJyWydkZXNjcmlwdGlvbiddKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMucmVzZXRQYXNzd29yZFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBnZXQgcmVkaXJlY3RVUkwoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29va2llU3RvcmFnZS5nZXQoJ3JlZGlyZWN0VXJsJyk7XG4gIH1cbn1cbiJdfQ==