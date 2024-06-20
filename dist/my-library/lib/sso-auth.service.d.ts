import { HttpClient } from '@angular/common/http';
import { CookieService } from './cookie.service';
import * as i0 from "@angular/core";
export declare class SSOAuthService {
    private http;
    private readonly cookieStorage;
    private baseAPI;
    private signUpSubject;
    private loginSubject;
    private verifyEmailSubject;
    private sendOTPSubject;
    private validateOTPSubject;
    private forgotPasswordSubject;
    private resetPasswordSubject;
    constructor(http: HttpClient, cookieStorage: CookieService);
    login(payload: {
        EmailAddress: string;
        Password: string;
    }): import("rxjs").Observable<unknown>;
    private setUserDetails;
    signup(payload: any): import("rxjs").Observable<unknown>;
    verifyEmail(payload: {
        token: string;
        userId: string;
    }): import("rxjs").Observable<unknown>;
    sendOTP(OtpType: number): import("rxjs").Observable<boolean>;
    validateOTP(token: string): import("rxjs").Observable<unknown>;
    forgotPassword(emailAddress: string): import("rxjs").Observable<boolean>;
    resetPassword(payload: {
        password: string;
        confirmPassword: string;
        userId: string;
    }): import("rxjs").Observable<any>;
    get redirectURL(): string | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<SSOAuthService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SSOAuthService>;
}
