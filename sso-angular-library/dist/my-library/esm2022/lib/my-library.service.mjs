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
        this.baseAPI = 'https://securepay-staging-api.secureid-digital.com.ng/api';
        // private baseAPI = 'https://secureauth.secureid-digital.com.ng/api';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktbGlicmFyeS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbXktbGlicmFyeS9zcmMvbGliL215LWxpYnJhcnkuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBYyxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUcvRCxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBTTNDLE1BQU0sT0FBTyxnQkFBZ0I7SUFrQjNCLFlBQ1UsSUFBZ0IsRUFDUCxhQUE0QjtRQURyQyxTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ1Asa0JBQWEsR0FBYixhQUFhLENBQWU7UUFuQnZDLFlBQU8sR0FBRywyREFBMkQsQ0FBQztRQUM5RSxzRUFBc0U7UUFDdEUseUNBQXlDO1FBQ2pDLGtCQUFhLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUM5QixpQkFBWSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDN0Isb0JBQWUsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ2hDLHVCQUFrQixHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDbkMsbUJBQWMsR0FBRyxJQUFJLE9BQU8sRUFBVyxDQUFDO1FBQ3hDLHVCQUFrQixHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDbkMsMEJBQXFCLEdBQUcsSUFBSSxPQUFPLEVBQVcsQ0FBQztRQUMvQyx5QkFBb0IsR0FBRyxJQUFJLE9BQU8sRUFBTyxDQUFDO1FBR2xELHlCQUFvQixHQUFHLDhLQUE4SyxDQUFBO1FBQ3JNLDRCQUF1QixHQUFHLHdJQUF3SSxDQUFBO1FBQ2xLLCtCQUEwQixHQUFHLGFBQWEsQ0FBQTtJQUt2QyxDQUFDO0lBRUoseUJBQXlCLENBQUMsS0FBYTtRQUNyQyxNQUFNLE9BQU8sR0FBRyx5Q0FBeUMsQ0FBQztR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QyxDQUFDO29CQUM5QixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN0QztxQkFBTTtvQkFDTCx3QkFBd0I7b0JBQ3hCLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztpQkFDOUM7WUFDSCxDQUFDO1lBQ0QsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ2Isd0JBQXdCO2dCQUN4QixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3JELENBQUM7U0FDRixDQUFDLENBQUM7UUFFTCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNsRCxDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ2IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMvQyxDQUFDOytHQXZUVSxnQkFBZ0I7bUhBQWhCLGdCQUFnQixjQUZmLE1BQU07OzRGQUVQLGdCQUFnQjtrQkFINUIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IENvb2tpZVNlcnZpY2UgfSBmcm9tICcuL2Nvb2tpZS5zZXJ2aWNlJztcbmltcG9ydCB7IEFwcFBhcmFtcywgSHR0cFJlc3BvbnNlLCBMb2dpbkRhdGEgfSBmcm9tICcuL21vZGVsJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGVudmlyb25tZW50IH0gZnJvbSAnLi4vZW52aXJvbm1lbnRzL2Vudmlyb25tZW50JztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuZXhwb3J0IGNsYXNzIE15TGlicmFyeVNlcnZpY2Uge1xuICBwcml2YXRlIGJhc2VBUEkgPSAnaHR0cHM6Ly9zZWN1cmVwYXktc3RhZ2luZy1hcGkuc2VjdXJlaWQtZGlnaXRhbC5jb20ubmcvYXBpJztcbiAgLy8gcHJpdmF0ZSBiYXNlQVBJID0gJ2h0dHBzOi8vc2VjdXJlYXV0aC5zZWN1cmVpZC1kaWdpdGFsLmNvbS5uZy9hcGknO1xuICAvLyBwcml2YXRlIGJhc2VBUEkgPSBlbnZpcm9ubWVudC5iYXNlQVBJO1xuICBwcml2YXRlIHNpZ25VcFN1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICBwcml2YXRlIGxvZ2luU3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgYXBwU2V0dXBTdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSB2ZXJpZnlFbWFpbFN1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICBwcml2YXRlIHNlbmRPVFBTdWJqZWN0ID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcbiAgcHJpdmF0ZSB2YWxpZGF0ZU9UUFN1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICBwcml2YXRlIGZvcmdvdFBhc3N3b3JkU3ViamVjdCA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XG4gIHByaXZhdGUgcmVzZXRQYXNzd29yZFN1YmplY3QgPSBuZXcgU3ViamVjdDxhbnk+KCk7XG4gIHByaXZhdGUgcXVlcnlPYmplY3Q6IGFueTtcblxuICBlbWFpbFZhbGlkYXRpb25SZWdleCA9IC8oWy0hIy0nKisvLTk9P0EtWl4tfl0rKFxcLlstISMtJyorLy05PT9BLVpeLX5dKykqfFwiKFtdISMtW14tfiBcXHRdfChcXFxcW1xcdCAtfl0pKStcIilAWzAtOUEtWmEtel0oWzAtOUEtWmEtei1dezAsNjF9WzAtOUEtWmEtel0pPyhcXC5bMC05QS1aYS16XShbMC05QS1aYS16LV17MCw2MX1bMC05QS1aYS16XSk/KSsvXG4gIHBhc3N3b3JkVmFsaWRhdGlvblJlZ2V4ID0gL14oPz0uKlthLXpdKSg/PS4qW0EtWl0pKD89LipcXGQpKD89LipbYCFAIyQlXiYqKClfK1xcLT1cXFtcXF17fTsnOlwiXFxcXHwsLjw+XFwvP35dKVtBLVphLXpcXGRgIUAjJCVeJiooKV8rXFwtPVxcW1xcXXt9Oyc6XCJcXFxcfCwuPD5cXC8/fl17OCwxMDAwMDB9JC9cbiAgcGhvbmVOdW1iZXJWYWxpZGF0aW9uUmVnZXggPSAvXjBcXGR7OCwxMH0kL1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvb2tpZVN0b3JhZ2U6IENvb2tpZVNlcnZpY2VcbiAgKSB7fVxuXG4gIGNoZWNrRm9yU3BlY2lhbENoYXJhY3RlcnMocXVlcnk6IHN0cmluZykge1xuICAgIGNvbnN0IHBhdHRlcm4gPSAvW2AhQCMkJV4mKigpXytcXC09XFxbXFxde307JzpcIlxcXFx8LC48PlxcLz9+XS87XG4gICAgcmV0dXJuIHBhdHRlcm4udGVzdChxdWVyeSlcbiAgfVxuXG4gIGNoZWNrRm9yRGlnaXRzKHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gL1xcZC87XG4gICAgcmV0dXJuIHBhdHRlcm4udGVzdChxdWVyeSlcbiAgfVxuXG4gIGNoZWNrRm9yTG93ZXJjYXNlKHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gL1thLXpdLztcbiAgICByZXR1cm4gcGF0dGVybi50ZXN0KHF1ZXJ5KVxuICB9XG5cbiAgY2hlY2tGb3JVcHBlcmNhc2UocXVlcnk6IHN0cmluZykge1xuICAgIGNvbnN0IHBhdHRlcm4gPSAvW0EtWl0vO1xuICAgIHJldHVybiBwYXR0ZXJuLnRlc3QocXVlcnkpXG4gIH1cblxuICBpbml0aWFsaXplQXBwKHF1ZXJ5OiBhbnkpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IHF1ZXJ5T2JqZWN0ID0gcXVlcnk7XG4gICAgdGhpcy5xdWVyeU9iamVjdCA9IHF1ZXJ5T2JqZWN0O1xuICAgIGNvbnN0IGFwcFBhcmFtcyA9IHF1ZXJ5T2JqZWN0WydwYXJhbXMnXTtcbiAgICBpZiAoIWFwcFBhcmFtcykge1xuICAgICAgY29uc3QgZXJyb3IgPSB7XG4gICAgICAgIHRpdGxlOiAnQXBwIFBhcmFtcyBNaXNzaW5nJyxcbiAgICAgICAgbWVzc2FnZTogJ05vIGFwcCBwYXJhbXMnLFxuICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICBxdWVyeU9iamVjdDogdGhpcy5xdWVyeU9iamVjdCB8fCB7fSxcbiAgICAgIH07XG4gICAgICB0aGlzLmFwcFNldHVwU3ViamVjdC5lcnJvcihlcnJvcik7XG4gICAgICByZXR1cm4gdGhpcy5hcHBTZXR1cFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuICAgIGNvbnN0IHJvbGUgPSBxdWVyeU9iamVjdFsncm9sZSddO1xuICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoJ2FwcFBhcmFtcycsIGFwcFBhcmFtcyk7XG4gICAgdGhpcy5jb29raWVTdG9yYWdlLnNldCgncm9sZScsIHJvbGUpO1xuICAgIHJldHVybiB0aGlzLmFwcEluaXQoKTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0dXBBcHAoZGF0YTogQXBwUGFyYW1zKSB7XG4gICAgLy8gdGhpcy5hcHBJc1NldHVwID0gdHJ1ZTtcbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2UucmVtb3ZlKCdhcHBQYXJhbXMnKTtcbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KFxuICAgICAgJ3JlZGlyZWN0VXJsJyxcbiAgICAgIGRhdGEuY2xpZW50LnJlZGlyZWN0VXJpLFxuICAgICAgZGF0YS5leHBpcmVzSW5cbiAgICApO1xuICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoJ2FjY2Vzc1Rva2VuJywgZGF0YS5hY2Nlc3NUb2tlbiwgZGF0YS5leHBpcmVzSW4pO1xuICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoJ3Rva2VuVHlwZScsIGRhdGEudG9rZW5UeXBlLCBkYXRhLmV4cGlyZXNJbik7XG4gICAgdGhpcy5hcHBTZXR1cFN1YmplY3QubmV4dCh7XG4gICAgICB0aXRsZTogJ1N1Y2Nlc3MnLFxuICAgICAgbWVzc2FnZTogJ0l0ZW1zIHNhdmVkIHRvIGNvb2tpZXMgc3RvcmFnZScsXG4gICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICBxdWVyeU9iamVjdDogdGhpcy5xdWVyeU9iamVjdCxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXBwSW5pdCgpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHRoaXMuaHR0cC5wb3N0PEFwcFBhcmFtcz4oYCR7dGhpcy5iYXNlQVBJfS9hdXRoL2dldC10b2tlbmAsIHt9KS5zdWJzY3JpYmUoe1xuICAgICAgbmV4dDogKHJlcykgPT4ge1xuICAgICAgICBpZiAocmVzKSB7XG4gICAgICAgICAgdGhpcy5zZXR1cEFwcChyZXMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVycm9yID0ge1xuICAgICAgICAgIHRpdGxlOiAnTm8gcmVzIGZyb20gYXBpIGNhbGwnLFxuICAgICAgICAgIG1lc3NhZ2U6ICdDaGVjayBiYWNrZW5kIGFwcCcsXG4gICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICBxdWVyeU9iamVjdDogdGhpcy5xdWVyeU9iamVjdCB8fCB7fSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hcHBTZXR1cFN1YmplY3QuZXJyb3IoZXJyb3IpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IGVycm9yID0ge1xuICAgICAgICAgIHRpdGxlOiAnQXBpIEVycm9yJyxcbiAgICAgICAgICBtZXNzYWdlOiBgU29tZXRoaW5nIHdlbnQgd3JvbmcsIFBsZWFzZSByZWZyZXNoIHRoZSBhcHBgLFxuICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgcXVlcnlPYmplY3Q6IHRoaXMucXVlcnlPYmplY3QgfHwge30sXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYXBwU2V0dXBTdWJqZWN0LmVycm9yKGVycm9yKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5hcHBTZXR1cFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBsb2dpbihwYXlsb2FkOiB7IEVtYWlsQWRkcmVzczogc3RyaW5nOyBQYXNzd29yZDogc3RyaW5nIH0pIHtcbiAgICAvLyBUb2RvOiBoYW5kbGUgbG9naW5cbiAgICBjb25zdCBlbmNvZGVkRGF0YSA9IGJ0b2EoSlNPTi5zdHJpbmdpZnkocGF5bG9hZCkpO1xuXG4gICAgbGV0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcbiAgICBoZWFkZXJzID0gaGVhZGVycy5hcHBlbmQoJ0Jhc2ljJywgZW5jb2RlZERhdGEpO1xuXG4gICAgdGhpcy5odHRwXG4gICAgICAucG9zdDxMb2dpbkRhdGE+KGAke3RoaXMuYmFzZUFQSX0vYXV0aC9hdXRoZW50aWNhdGVgLCB7fSwgeyBoZWFkZXJzIH0pXG4gICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogKHJlczogTG9naW5EYXRhKSA9PiB7XG4gICAgICAgICAgaWYgKHJlc1sndXNlcklkJ10pIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VXNlckRldGFpbHMocmVzKTtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJEYXRhID0gIChyZXMgYXMgTG9naW5EYXRhKVxuICAgICAgICAgICAgdGhpcy5sb2dpblN1YmplY3QubmV4dCh1c2VyRGF0YSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlc1snZGVzY3JpcHRpb24nXTtcbiAgICAgICAgICAgIHRoaXMubG9naW5TdWJqZWN0Lm5leHQoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgdGhpcy5sb2dpblN1YmplY3QubmV4dChlcnJbJ2Rlc2NyaXB0aW9uJ10pO1xuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5sb2dpblN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICAvLyBzZXRVc2VyRGV0YWlscyhkYXRhOiBMb2dpbkRhdGEpIHtcbiAgcHJpdmF0ZSBzZXRVc2VyRGV0YWlscyhkYXRhOiBhbnkpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBkYXRhKSB7XG4gICAgICBpZiAoZGF0YVtrZXldKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YVtrZXldID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoa2V5LCBKU09OLnN0cmluZ2lmeShkYXRhW2tleV0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KGtleSwgZGF0YVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNpZ251cChwYXlsb2FkOiBhbnkpIHtcbiAgICB0aGlzLmh0dHAucG9zdChgJHt0aGlzLmJhc2VBUEl9L2F1dGgvcmVnaXN0ZXJgLCBwYXlsb2FkKS5zdWJzY3JpYmUoe1xuICAgICAgbmV4dDogKHJlczogYW55KSA9PiB7XG4gICAgICAgIGlmIChyZXNbJ2RhdGEnXSkge1xuICAgICAgICAgIHRoaXMuc2lnblVwU3ViamVjdC5uZXh0KHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlc1snZGVzY3JpcHRpb24nXTtcbiAgICAgICAgICB0aGlzLnNpZ25VcFN1YmplY3QubmV4dChlcnJvck1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZXJyb3I6IChlcnI6IGFueSkgPT4ge1xuICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgdGhpcy5zaWduVXBTdWJqZWN0Lm5leHQoZXJyWydkZXNjcmlwdGlvbiddKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5zaWduVXBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgdmVyaWZ5RW1haWwocGF5bG9hZDogeyB0b2tlbjogc3RyaW5nOyB1c2VySWQ6IHN0cmluZyB9KSB7XG4gICAgdGhpcy5odHRwLnBvc3QoYCR7dGhpcy5iYXNlQVBJfS9hdXRoL0NvbmZpcm0tRW1haWxgLCBwYXlsb2FkKS5zdWJzY3JpYmUoe1xuICAgICAgbmV4dDogKHJlczogYW55KSA9PiB7XG4gICAgICAgIGlmIChyZXNbJ3VzZXJJZCddKSB7XG4gICAgICAgICAgdGhpcy52ZXJpZnlFbWFpbFN1YmplY3QubmV4dCh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSByZXNbJ2Rlc2NyaXB0aW9uJ107XG4gICAgICAgICAgdGhpcy5mb3Jnb3RQYXNzd29yZFN1YmplY3QubmV4dChlcnJvck1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0Lm5leHQoZXJyWydkZXNjcmlwdGlvbiddKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy52ZXJpZnlFbWFpbFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBzZW5kT1RQKE90cFR5cGU6IG51bWJlcikge1xuICAgIGNvbnN0IHVzZXJJZCA9IHRoaXMuY29va2llU3RvcmFnZS5nZXQoJ3VzZXJJZCcpO1xuICAgIGlmICh1c2VySWQpIHtcbiAgICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICAgIE90cFR5cGUsXG4gICAgICAgIHVzZXJJZCxcbiAgICAgIH07XG4gICAgICB0aGlzLmh0dHBcbiAgICAgICAgLnBvc3Q8SHR0cFJlc3BvbnNlPHN0cmluZz4+KGAke3RoaXMuYmFzZUFQSX0vb3RwL3NlbmQtb3RwYCwgcGF5bG9hZClcbiAgICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgICAgbmV4dDogKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICAgIGlmIChyZXNbJ3VzZXJJZCddKSB7XG4gICAgICAgICAgICAgIHRoaXMuc2VuZE9UUFN1YmplY3QubmV4dCh0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlc1snZGVzY3JpcHRpb24nXTtcbiAgICAgICAgICAgICAgdGhpcy5zZW5kT1RQU3ViamVjdC5uZXh0KGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgICB0aGlzLnNlbmRPVFBTdWJqZWN0Lm5leHQoZXJyWydkZXNjcmlwdGlvbiddKTtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgcmV0dXJuIHRoaXMuc2VuZE9UUFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuICAgIHRoaXMuc2VuZE9UUFN1YmplY3QubmV4dChmYWxzZSk7XG4gICAgcmV0dXJuIHRoaXMuc2VuZE9UUFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICB2YWxpZGF0ZU9UUCh0b2tlbjogc3RyaW5nKSB7XG4gICAgY29uc3QgdXNlcklkID0gdGhpcy5jb29raWVTdG9yYWdlLmdldCgndXNlcklkJyk7XG5cbiAgICBpZiAodXNlcklkKSB7XG4gICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICB0b2tlbixcbiAgICAgICAgdXNlcklkLFxuICAgICAgfTtcbiAgICAgIHRoaXMuaHR0cFxuICAgICAgICAucG9zdDxMb2dpbkRhdGE+KGAke3RoaXMuYmFzZUFQSX0vb3RwL3ZhbGlkYXRlLW90cGAsIHBheWxvYWQpXG4gICAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICAgIG5leHQ6IChyZXMpID0+IHtcbiAgICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgICAgaWYgKHJlc1sndG9rZW4nXSkge1xuICAgICAgICAgICAgICB0aGlzLnNldFVzZXJEZXRhaWxzKHJlcyk7XG4gICAgICAgICAgICAgIHRoaXMudmFsaWRhdGVPVFBTdWJqZWN0Lm5leHQocmVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlc1snZGVzY3JpcHRpb24nXTtcbiAgICAgICAgICAgICAgdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QubmV4dChlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QubmV4dChlcnJbJ2Rlc2NyaXB0aW9uJ10pO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuXG4gICAgdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QubmV4dChmYWxzZSk7XG4gICAgcmV0dXJuIHRoaXMudmFsaWRhdGVPVFBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgZm9yZ290UGFzc3dvcmQoZW1haWxBZGRyZXNzOiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgZW1haWxBZGRyZXNzLFxuICAgIH07XG4gICAgdGhpcy5odHRwXG4gICAgICAucG9zdDxIdHRwUmVzcG9uc2U8TG9naW5EYXRhPj4oXG4gICAgICAgIGAke3RoaXMuYmFzZUFQSX0vYXV0aC9mb3Jnb3QtcGFzc3dvcmRgLFxuICAgICAgICBwYXlsb2FkXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgaWYgKHJlc1snZGF0YSddKSB7XG4gICAgICAgICAgICB0aGlzLnNldFVzZXJEZXRhaWxzKHJlcy5kYXRhKTtcbiAgICAgICAgICAgIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0Lm5leHQodHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlc1snZGVzY3JpcHRpb24nXTtcbiAgICAgICAgICAgIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0Lm5leHQoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgdGhpcy5mb3Jnb3RQYXNzd29yZFN1YmplY3QubmV4dChlcnJbJ2Rlc2NyaXB0aW9uJ10pO1xuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5mb3Jnb3RQYXNzd29yZFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICByZXNldFBhc3N3b3JkKHBheWxvYWQ6IHtcbiAgICBwYXNzd29yZDogc3RyaW5nO1xuICAgIGNvbmZpcm1QYXNzd29yZDogc3RyaW5nO1xuICAgIHVzZXJJZDogc3RyaW5nO1xuICB9KSB7XG4gICAgdGhpcy5odHRwXG4gICAgICAucG9zdDxMb2dpbkRhdGE+KGAke3RoaXMuYmFzZUFQSX0vYXV0aC9yZXNldC1wYXNzd29yZGAsIHBheWxvYWQpXG4gICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogKHJlcykgPT4ge1xuICAgICAgICAgIGlmIChyZXNbJ2RhdGEnXSA9PT0gJ1Bhc3N3b3JkIHJlc2V0IHN1Y2Nlc3NmdWwuJykge1xuICAgICAgICAgICAgdGhpcy5zZXRVc2VyRGV0YWlscyhyZXMuZGF0YSk7XG4gICAgICAgICAgICB0aGlzLnJlc2V0UGFzc3dvcmRTdWJqZWN0Lm5leHQodHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzWydkZXNjcmlwdGlvbiddO1xuICAgICAgICAgICAgdGhpcy5yZXNldFBhc3N3b3JkU3ViamVjdC5uZXh0KGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgIHRoaXMucmVzZXRQYXNzd29yZFN1YmplY3QubmV4dChlcnJbJ2Rlc2NyaXB0aW9uJ10pO1xuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5yZXNldFBhc3N3b3JkU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIGdldCByZWRpcmVjdFVSTCgpIHtcbiAgICByZXR1cm4gdGhpcy5jb29raWVTdG9yYWdlLmdldCgncmVkaXJlY3RVcmwnKTtcbiAgfVxufVxuIl19