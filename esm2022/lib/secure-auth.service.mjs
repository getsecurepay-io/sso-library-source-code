import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "./cookie.service";
export class SecureAuthService {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: SecureAuthService, deps: [{ token: i1.HttpClient }, { token: i2.CookieService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: SecureAuthService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: SecureAuthService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return [{ type: i1.HttpClient }, { type: i2.CookieService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJlLWF1dGguc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL215LWxpYnJhcnkvc3JjL2xpYi9zZWN1cmUtYXV0aC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFjLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRy9ELE9BQU8sRUFBYyxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7Ozs7QUFLM0MsTUFBTSxPQUFPLGlCQUFpQjtJQWtCNUIsWUFDVSxJQUFnQixFQUNQLGFBQTRCO1FBRHJDLFNBQUksR0FBSixJQUFJLENBQVk7UUFDUCxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQW5CL0MsWUFBTyxHQUFHLEVBQUUsQ0FBQztRQUNMLGtCQUFhLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUM5QixpQkFBWSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDN0Isb0JBQWUsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ2hDLHVCQUFrQixHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDbkMsbUJBQWMsR0FBRyxJQUFJLE9BQU8sRUFBVyxDQUFDO1FBQ3hDLHVCQUFrQixHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDbkMsMEJBQXFCLEdBQUcsSUFBSSxPQUFPLEVBQVcsQ0FBQztRQUMvQyx5QkFBb0IsR0FBRyxJQUFJLE9BQU8sRUFBTyxDQUFDO1FBR2xELHlCQUFvQixHQUNsQiw4S0FBOEssQ0FBQztRQUNqTCw0QkFBdUIsR0FDckIsd0lBQXdJLENBQUM7UUFDM0ksK0JBQTBCLEdBQUcsYUFBYSxDQUFDO0lBS3hDLENBQUM7SUFFSix5QkFBeUIsQ0FBQyxLQUFhO1FBQ3JDLE1BQU0sT0FBTyxHQUFHLHlDQUF5QyxDQUFDO1FBQzFELE9BQU8sT0FBTyxDQUFDLElBQUks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SUFBSSxDQUFDLElBQUk7YUFDTixJQUFJLENBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxzQkFBc0IsRUFBRSxPQUFPLEVBQUU7WUFDL0QsT0FBTztTQUNSLENBQUM7YUFDRCxTQUFTLENBQUM7WUFDVCxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDWixJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyw0QkFBNEIsRUFBRTtvQkFDaEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzlCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3RDO3FCQUFNO29CQUNMLHdCQUF3QjtvQkFDeEIsTUFBTSxZQUFZLEdBQUcsR0FBRyxFQUFFLFdBQVcsSUFBSSxRQUFRLENBQUM7b0JBQ2xELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQzlDO1lBQ0gsQ0FBQztZQUNELEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNiLHdCQUF3QjtnQkFDeEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsV0FBVyxJQUFJLFFBQVEsQ0FBQyxDQUFDO1lBQy9ELENBQUM7U0FDRixDQUFDLENBQUM7UUFFTCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNsRCxDQUFDOytHQXpWVSxpQkFBaUI7bUhBQWpCLGlCQUFpQixjQUZoQixNQUFNOzs0RkFFUCxpQkFBaUI7a0JBSDdCLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBDb29raWVTZXJ2aWNlIH0gZnJvbSAnLi9jb29raWUuc2VydmljZSc7XG5pbXBvcnQgeyBBcHBQYXJhbXMsIEh0dHBSZXNwb25zZSwgTG9naW5EYXRhIH0gZnJvbSAnLi9tb2RlbCc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxufSlcbmV4cG9ydCBjbGFzcyBTZWN1cmVBdXRoU2VydmljZSB7XG4gIGJhc2VBUEkgPSAnJztcbiAgcHJpdmF0ZSBzaWduVXBTdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSBsb2dpblN1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICBwcml2YXRlIGFwcFNldHVwU3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgdmVyaWZ5RW1haWxTdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSBzZW5kT1RQU3ViamVjdCA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XG4gIHByaXZhdGUgdmFsaWRhdGVPVFBTdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSBmb3Jnb3RQYXNzd29yZFN1YmplY3QgPSBuZXcgU3ViamVjdDxib29sZWFuPigpO1xuICBwcml2YXRlIHJlc2V0UGFzc3dvcmRTdWJqZWN0ID0gbmV3IFN1YmplY3Q8YW55PigpO1xuICBwcml2YXRlIHF1ZXJ5T2JqZWN0OiBhbnk7XG5cbiAgZW1haWxWYWxpZGF0aW9uUmVnZXggPVxuICAgIC8oWy0hIy0nKisvLTk9P0EtWl4tfl0rKFxcLlstISMtJyorLy05PT9BLVpeLX5dKykqfFwiKFtdISMtW14tfiBcXHRdfChcXFxcW1xcdCAtfl0pKStcIilAWzAtOUEtWmEtel0oWzAtOUEtWmEtei1dezAsNjF9WzAtOUEtWmEtel0pPyhcXC5bMC05QS1aYS16XShbMC05QS1aYS16LV17MCw2MX1bMC05QS1aYS16XSk/KSsvO1xuICBwYXNzd29yZFZhbGlkYXRpb25SZWdleCA9XG4gICAgL14oPz0uKlthLXpdKSg/PS4qW0EtWl0pKD89LipcXGQpKD89LipbYCFAIyQlXiYqKClfK1xcLT1cXFtcXF17fTsnOlwiXFxcXHwsLjw+XFwvP35dKVtBLVphLXpcXGRgIUAjJCVeJiooKV8rXFwtPVxcW1xcXXt9Oyc6XCJcXFxcfCwuPD5cXC8/fl17OCwxMDAwMDB9JC87XG4gIHBob25lTnVtYmVyVmFsaWRhdGlvblJlZ2V4ID0gL14wXFxkezgsMTB9JC87XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY29va2llU3RvcmFnZTogQ29va2llU2VydmljZVxuICApIHt9XG5cbiAgY2hlY2tGb3JTcGVjaWFsQ2hhcmFjdGVycyhxdWVyeTogc3RyaW5nKSB7XG4gICAgY29uc3QgcGF0dGVybiA9IC9bYCFAIyQlXiYqKClfK1xcLT1cXFtcXF17fTsnOlwiXFxcXHwsLjw+XFwvP35dLztcbiAgICByZXR1cm4gcGF0dGVybi50ZXN0KHF1ZXJ5KTtcbiAgfVxuXG4gIGNoZWNrRm9yRGlnaXRzKHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gL1xcZC87XG4gICAgcmV0dXJuIHBhdHRlcm4udGVzdChxdWVyeSk7XG4gIH1cblxuICBjaGVja0Zvckxvd2VyY2FzZShxdWVyeTogc3RyaW5nKSB7XG4gICAgY29uc3QgcGF0dGVybiA9IC9bYS16XS87XG4gICAgcmV0dXJuIHBhdHRlcm4udGVzdChxdWVyeSk7XG4gIH1cblxuICBjaGVja0ZvclVwcGVyY2FzZShxdWVyeTogc3RyaW5nKSB7XG4gICAgY29uc3QgcGF0dGVybiA9IC9bQS1aXS87XG4gICAgcmV0dXJuIHBhdHRlcm4udGVzdChxdWVyeSk7XG4gIH1cblxuICBwcml2YXRlIGdldCBoZWFkZXJzKCk6IEh0dHBIZWFkZXJzIHtcbiAgICBsZXQgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycygpO1xuICAgIGNvbnN0IGFjY2Vzc1Rva2VuID0gdGhpcy5jb29raWVTdG9yYWdlLmdldCh0aGlzLmNvb2tpZVN0b3JhZ2UuQ09PS0lFX05BTUUpO1xuICAgIGNvbnN0IHRva2VuVHlwZSA9IHRoaXMuY29va2llU3RvcmFnZS5nZXQoJ3Rva2VuVHlwZScpO1xuICAgIGhlYWRlcnMgPSBoZWFkZXJzLmFwcGVuZCgnQXV0aG9yaXphdGlvbicsIGAke3Rva2VuVHlwZX0gJHthY2Nlc3NUb2tlbn1gKTtcblxuICAgIHJldHVybiBoZWFkZXJzO1xuICB9XG5cbiAgaW5pdGlhbGl6ZUFwcChxdWVyeTogeyBwYXJhbXM6IHN0cmluZzsgdXJsOiBzdHJpbmcgfSk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgY29uc3QgcXVlcnlPYmplY3QgPSBxdWVyeTtcbiAgICB0aGlzLnF1ZXJ5T2JqZWN0ID0gcXVlcnlPYmplY3Q7XG4gICAgY29uc3QgYXBwUGFyYW1zID0gcXVlcnlPYmplY3RbJ3BhcmFtcyddO1xuICAgIHRoaXMuYmFzZUFQSSA9IHF1ZXJ5T2JqZWN0Wyd1cmwnXTtcbiAgICBpZiAoIWFwcFBhcmFtcykge1xuICAgICAgY29uc3QgZXJyb3IgPSB7XG4gICAgICAgIHRpdGxlOiAnQXBwIFBhcmFtcyBNaXNzaW5nJyxcbiAgICAgICAgbWVzc2FnZTogJ05vIGFwcCBwYXJhbXMnLFxuICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICBxdWVyeU9iamVjdDogdGhpcy5xdWVyeU9iamVjdCB8fCB7fSxcbiAgICAgIH07XG4gICAgICB0aGlzLmFwcFNldHVwU3ViamVjdC5lcnJvcihlcnJvcik7XG4gICAgICByZXR1cm4gdGhpcy5hcHBTZXR1cFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuICAgIC8vIGNvbnN0IHJvbGUgPSBxdWVyeU9iamVjdFsncm9sZSddO1xuICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoJ3NzbycsIHRoaXMuYmFzZUFQSSk7XG4gICAgdGhpcy5jb29raWVTdG9yYWdlLnNldCgnYXBwUGFyYW1zJywgYXBwUGFyYW1zKTtcbiAgICAvLyB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KCdyb2xlJywgcm9sZSk7XG4gICAgcmV0dXJuIHRoaXMuYXBwSW5pdCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhcHBJbml0KCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgY29uc3QgYWNjZXNzVG9rZW4gPSB0aGlzLmNvb2tpZVN0b3JhZ2UuZ2V0KCdhcHBQYXJhbXMnKSB8fCAnJztcbiAgICBsZXQgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycygpO1xuICAgIGhlYWRlcnMgPSBoZWFkZXJzLmFwcGVuZCgnQmFzaWMnLCBhY2Nlc3NUb2tlbik7XG5cbiAgICB0aGlzLmh0dHBcbiAgICAgIC5wb3N0PEFwcFBhcmFtcz4oYCR7dGhpcy5iYXNlQVBJfS9hdXRoL2dldC10b2tlbmAsIHt9LCB7IGhlYWRlcnMgfSlcbiAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICBuZXh0OiAocmVzKSA9PiB7XG4gICAgICAgICAgaWYgKHJlcykge1xuICAgICAgICAgICAgdGhpcy5zZXR1cEFwcChyZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBlcnJvciA9IHtcbiAgICAgICAgICAgIHRpdGxlOiAnTm8gcmVzIGZyb20gYXBpIGNhbGwnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ0NoZWNrIGJhY2tlbmQgYXBwJyxcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICBxdWVyeU9iamVjdDogdGhpcy5xdWVyeU9iamVjdCB8fCB7fSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMuYXBwU2V0dXBTdWJqZWN0LmVycm9yKGVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICBjb25zdCBlcnJvciA9IHtcbiAgICAgICAgICAgIHRpdGxlOiAnQXBpIEVycm9yJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBTb21ldGhpbmcgd2VudCB3cm9uZywgUGxlYXNlIHJlZnJlc2ggdGhlIGFwcGAsXG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgcXVlcnlPYmplY3Q6IHRoaXMucXVlcnlPYmplY3QgfHwge30sXG4gICAgICAgICAgfTtcbiAgICAgICAgICB0aGlzLmFwcFNldHVwU3ViamVjdC5lcnJvcihlcnJvcik7XG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLmFwcFNldHVwU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0dXBBcHAoZGF0YTogQXBwUGFyYW1zKSB7XG4gICAgLy8gdGhpcy5hcHBJc1NldHVwID0gdHJ1ZTtcbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2UucmVtb3ZlKCdhcHBQYXJhbXMnKTtcbiAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KFxuICAgICAgJ3JlZGlyZWN0VXJsJyxcbiAgICAgIGRhdGEuY2xpZW50LnJlZGlyZWN0VXJpLFxuICAgICAgZGF0YS5leHBpcmVzSW5cbiAgICApO1xuICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoJ2FjY2Vzc1Rva2VuJywgZGF0YS5hY2Nlc3NUb2tlbiwgZGF0YS5leHBpcmVzSW4pO1xuICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoJ3Rva2VuVHlwZScsIGRhdGEudG9rZW5UeXBlLCBkYXRhLmV4cGlyZXNJbik7XG4gICAgdGhpcy5hcHBTZXR1cFN1YmplY3QubmV4dCh7XG4gICAgICB0aXRsZTogJ1N1Y2Nlc3MnLFxuICAgICAgbWVzc2FnZTogJ0l0ZW1zIHNhdmVkIHRvIGNvb2tpZXMgc3RvcmFnZScsXG4gICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICBxdWVyeU9iamVjdDogdGhpcy5xdWVyeU9iamVjdCxcbiAgICB9KTtcbiAgfVxuXG4gIGxvZ2luKHBheWxvYWQ6IHsgRW1haWxBZGRyZXNzOiBzdHJpbmc7IFBhc3N3b3JkOiBzdHJpbmcgfSkge1xuICAgIC8vIFRvZG86IGhhbmRsZSBsb2dpblxuICAgIGNvbnN0IGVuY29kZWREYXRhID0gYnRvYShKU09OLnN0cmluZ2lmeShwYXlsb2FkKSk7XG4gICAgbGV0IGhlYWRlcnMgPSB0aGlzLmhlYWRlcnM7XG4gICAgaGVhZGVycyA9IGhlYWRlcnMuYXBwZW5kKCdCYXNpYycsIGVuY29kZWREYXRhKTtcblxuICAgIHRoaXMuaHR0cFxuICAgICAgLnBvc3Q8TG9naW5EYXRhPihgJHt0aGlzLmJhc2VBUEl9L2F1dGgvYXV0aGVudGljYXRlYCwge30sIHsgaGVhZGVycyB9KVxuICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IChyZXM6IExvZ2luRGF0YSkgPT4ge1xuICAgICAgICAgIGlmIChyZXNbJ3VzZXJJZCddKSB7XG4gICAgICAgICAgICB0aGlzLnNldFVzZXJEZXRhaWxzKHJlcyk7XG4gICAgICAgICAgICBjb25zdCB1c2VyRGF0YSA9IHJlcyBhcyBMb2dpbkRhdGE7XG4gICAgICAgICAgICB0aGlzLmxvZ2luU3ViamVjdC5uZXh0KHVzZXJEYXRhKTtcbiAgICAgICAgICAgIHRoaXMubG9naW5TdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlcz8uZGVzY3JpcHRpb24gfHwgJ0xvZ2luIGZhaWxlZCc7XG4gICAgICAgICAgICB0aGlzLmxvZ2luU3ViamVjdC5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0xvZ2luIGVycm9yIHJlczonLCBlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnTG9naW4gZXJyb3IgZXJyOicsIGVycik7XG4gICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgdGhpcy5sb2dpblN1YmplY3QuZXJyb3IoZXJyKTtcbiAgICAgICAgICB0aGlzLmxvZ2luU3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5sb2dpblN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICAvLyBzZXRVc2VyRGV0YWlscyhkYXRhOiBMb2dpbkRhdGEpIHtcbiAgcHJpdmF0ZSBzZXRVc2VyRGV0YWlscyhkYXRhOiBhbnkpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBkYXRhKSB7XG4gICAgICBpZiAoZGF0YVtrZXldKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YVtrZXldID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHRoaXMuY29va2llU3RvcmFnZS5zZXQoa2V5LCBKU09OLnN0cmluZ2lmeShkYXRhW2tleV0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNvb2tpZVN0b3JhZ2Uuc2V0KGtleSwgZGF0YVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNpZ251cChwYXlsb2FkOiBhbnkpIHtcbiAgICBsZXQgaGVhZGVycyA9IHRoaXMuaGVhZGVycztcbiAgICB0aGlzLmh0dHBcbiAgICAgIC5wb3N0KGAke3RoaXMuYmFzZUFQSX0vYXV0aC9yZWdpc3RlcmAsIHBheWxvYWQsIHsgaGVhZGVycyB9KVxuICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChyZXNbJ2RhdGEnXSkge1xuICAgICAgICAgICAgdGhpcy5zaWduVXBTdWJqZWN0Lm5leHQocmVzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzPy5kZXNjcmlwdGlvbiB8fCAnRmFpbGVkJztcbiAgICAgICAgICAgIHRoaXMuc2lnblVwU3ViamVjdC5uZXh0KGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKGVycjogYW55KSA9PiB7XG4gICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgdGhpcy5zaWduVXBTdWJqZWN0Lm5leHQoZXJyPy5kZXNjcmlwdGlvbiB8fCAnRmFpbGVkJyk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLnNpZ25VcFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICB2ZXJpZnlFbWFpbChwYXlsb2FkOiB7IHRva2VuOiBzdHJpbmc7IHVzZXJJZDogc3RyaW5nIH0pIHtcbiAgICBsZXQgaGVhZGVycyA9IHRoaXMuaGVhZGVycztcblxuICAgIHRoaXMuaHR0cFxuICAgICAgLnBvc3QoYCR7dGhpcy5iYXNlQVBJfS9hdXRoL0NvbmZpcm0tRW1haWxgLCBwYXlsb2FkLCB7IGhlYWRlcnMgfSlcbiAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICBuZXh0OiAocmVzOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAocmVzWyd1c2VySWQnXSkge1xuICAgICAgICAgICAgdGhpcy52ZXJpZnlFbWFpbFN1YmplY3QubmV4dCh0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzPy5kZXNjcmlwdGlvbiB8fCAnRmFpbGVkJztcbiAgICAgICAgICAgIHRoaXMuZm9yZ290UGFzc3dvcmRTdWJqZWN0Lm5leHQoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgdGhpcy5mb3Jnb3RQYXNzd29yZFN1YmplY3QubmV4dChlcnI/LmRlc2NyaXB0aW9uIHx8ICdGYWlsZWQnKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMudmVyaWZ5RW1haWxTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgc2VuZE9UUChPdHBUeXBlOiBudW1iZXIpIHtcbiAgICBsZXQgaGVhZGVycyA9IHRoaXMuaGVhZGVycztcbiAgICBjb25zdCB1c2VySWQgPSB0aGlzLmNvb2tpZVN0b3JhZ2UuZ2V0KCd1c2VySWQnKTtcbiAgICBpZiAodXNlcklkKSB7XG4gICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICBPdHBUeXBlLFxuICAgICAgICB1c2VySWQsXG4gICAgICB9O1xuICAgICAgdGhpcy5odHRwXG4gICAgICAgIC5wb3N0PEh0dHBSZXNwb25zZTxzdHJpbmc+PihgJHt0aGlzLmJhc2VBUEl9L290cC9zZW5kLW90cGAsIHBheWxvYWQsIHtcbiAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICB9KVxuICAgICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgICBuZXh0OiAocmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgICAgaWYgKHJlc1sndXNlcklkJ10pIHtcbiAgICAgICAgICAgICAgdGhpcy5zZW5kT1RQU3ViamVjdC5uZXh0KHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzPy5kZXNjcmlwdGlvbiB8fCAnRmFpbGVkJztcbiAgICAgICAgICAgICAgdGhpcy5zZW5kT1RQU3ViamVjdC5uZXh0KGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgICB0aGlzLnNlbmRPVFBTdWJqZWN0Lm5leHQoZXJyPy5kZXNjcmlwdGlvbiB8fCAnRmFpbGVkJyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB0aGlzLnNlbmRPVFBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cbiAgICB0aGlzLnNlbmRPVFBTdWJqZWN0Lm5leHQoZmFsc2UpO1xuICAgIHJldHVybiB0aGlzLnNlbmRPVFBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgdmFsaWRhdGVPVFAodG9rZW46IHN0cmluZykge1xuICAgIGNvbnN0IHVzZXJJZCA9IHRoaXMuY29va2llU3RvcmFnZS5nZXQoJ3VzZXJJZCcpO1xuXG4gICAgaWYgKHVzZXJJZCkge1xuICAgICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgICAgdG9rZW4sXG4gICAgICAgIHVzZXJJZCxcbiAgICAgIH07XG4gICAgICBsZXQgaGVhZGVycyA9IHRoaXMuaGVhZGVycztcbiAgICAgIHRoaXMuaHR0cFxuICAgICAgICAucG9zdDxMb2dpbkRhdGE+KGAke3RoaXMuYmFzZUFQSX0vb3RwL3ZhbGlkYXRlLW90cGAsIHBheWxvYWQsIHtcbiAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICB9KVxuICAgICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgICBuZXh0OiAocmVzKSA9PiB7XG4gICAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICAgIGlmIChyZXNbJ3Rva2VuJ10pIHtcbiAgICAgICAgICAgICAgdGhpcy5zZXRVc2VyRGV0YWlscyhyZXMpO1xuICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRlT1RQU3ViamVjdC5uZXh0KHJlcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSByZXM/LmRlc2NyaXB0aW9uIHx8ICdGYWlsZWQnO1xuICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRlT1RQU3ViamVjdC5uZXh0KGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgICAgLy8gc2Nyb2xsVG8oeyB0b3A6IDAgfSk7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlT1RQU3ViamVjdC5uZXh0KGVycj8uZGVzY3JpcHRpb24gfHwgJ0ZhaWxlZCcpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuXG4gICAgdGhpcy52YWxpZGF0ZU9UUFN1YmplY3QubmV4dChmYWxzZSk7XG4gICAgcmV0dXJuIHRoaXMudmFsaWRhdGVPVFBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgZm9yZ290UGFzc3dvcmQoZW1haWxBZGRyZXNzOiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgZW1haWxBZGRyZXNzLFxuICAgIH07XG4gICAgbGV0IGhlYWRlcnMgPSB0aGlzLmhlYWRlcnM7XG4gICAgdGhpcy5odHRwXG4gICAgICAucG9zdDxIdHRwUmVzcG9uc2U8TG9naW5EYXRhPj4oXG4gICAgICAgIGAke3RoaXMuYmFzZUFQSX0vYXV0aC9mb3Jnb3QtcGFzc3dvcmRgLFxuICAgICAgICBwYXlsb2FkLFxuICAgICAgICB7IGhlYWRlcnMgfVxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChyZXNbJ2RhdGEnXSkge1xuICAgICAgICAgICAgdGhpcy5zZXRVc2VyRGV0YWlscyhyZXMuZGF0YSk7XG4gICAgICAgICAgICB0aGlzLmZvcmdvdFBhc3N3b3JkU3ViamVjdC5uZXh0KHRydWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSByZXM/LmRlc2NyaXB0aW9uIHx8ICdGYWlsZWQnO1xuICAgICAgICAgICAgdGhpcy5mb3Jnb3RQYXNzd29yZFN1YmplY3QubmV4dChlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICB0aGlzLmZvcmdvdFBhc3N3b3JkU3ViamVjdC5uZXh0KGVycj8uZGVzY3JpcHRpb24gfHwgJ0ZhaWxlZCcpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5mb3Jnb3RQYXNzd29yZFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICByZXNldFBhc3N3b3JkKHBheWxvYWQ6IHtcbiAgICBwYXNzd29yZDogc3RyaW5nO1xuICAgIGNvbmZpcm1QYXNzd29yZDogc3RyaW5nO1xuICAgIHVzZXJJZDogc3RyaW5nO1xuICB9KSB7XG4gICAgbGV0IGhlYWRlcnMgPSB0aGlzLmhlYWRlcnM7XG4gICAgdGhpcy5odHRwXG4gICAgICAucG9zdDxMb2dpbkRhdGE+KGAke3RoaXMuYmFzZUFQSX0vYXV0aC9yZXNldC1wYXNzd29yZGAsIHBheWxvYWQsIHtcbiAgICAgICAgaGVhZGVycyxcbiAgICAgIH0pXG4gICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogKHJlcykgPT4ge1xuICAgICAgICAgIGlmIChyZXNbJ2RhdGEnXSA9PT0gJ1Bhc3N3b3JkIHJlc2V0IHN1Y2Nlc3NmdWwuJykge1xuICAgICAgICAgICAgdGhpcy5zZXRVc2VyRGV0YWlscyhyZXMuZGF0YSk7XG4gICAgICAgICAgICB0aGlzLnJlc2V0UGFzc3dvcmRTdWJqZWN0Lm5leHQodHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNjcm9sbFRvKHsgdG9wOiAwIH0pO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzPy5kZXNjcmlwdGlvbiB8fCAnRmFpbGVkJztcbiAgICAgICAgICAgIHRoaXMucmVzZXRQYXNzd29yZFN1YmplY3QubmV4dChlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAvLyBzY3JvbGxUbyh7IHRvcDogMCB9KTtcbiAgICAgICAgICB0aGlzLnJlc2V0UGFzc3dvcmRTdWJqZWN0Lm5leHQoZXJyPy5kZXNjcmlwdGlvbiB8fCAnRmFpbGVkJyk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLnJlc2V0UGFzc3dvcmRTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG59XG4iXX0=