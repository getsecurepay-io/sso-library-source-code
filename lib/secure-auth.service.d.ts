import { HttpClient } from '@angular/common/http';
import { CookieService } from './cookie.service';
import { LoginData } from './model';
import { Observable } from 'rxjs';
import * as i0 from "@angular/core";
export declare class SecureAuthService {
    private http;
    private readonly cookieStorage;
    baseAPI: string;
    private signUpSubject;
    private appSetupSubject;
    private verifyEmailSubject;
    private sendOTPSubject;
    private validateOTPSubject;
    private forgotPasswordSubject;
    private resetPasswordSubject;
    private queryObject;
    emailValidationRegex: RegExp;
    passwordValidationRegex: RegExp;
    phoneNumberValidationRegex: RegExp;
    constructor(http: HttpClient, cookieStorage: CookieService);
    checkForSpecialCharacters(query: string): boolean;
    checkForDigits(query: string): boolean;
    checkForLowercase(query: string): boolean;
    checkForUppercase(query: string): boolean;
    private get headers();
    initializeApp(query: {
        params: string;
        url: string;
    }): Observable<any>;
    private appInit;
    private setupApp;
    login(payload: {
        EmailAddress: string;
        Password: string;
    }): Observable<LoginData>;
    private setUserDetails;
    signup(payload: any): Observable<any>;
    verifyEmail(payload: {
        token: string;
        userId: string;
    }): Observable<boolean>;
    sendOTP(OtpType: number): Observable<boolean>;
    validateOTP(token: string): Observable<LoginData>;
    forgotPassword(emailAddress: string): Observable<boolean>;
    resetPassword(payload: {
        password: string;
        confirmPassword: string;
        userId: string;
    }): Observable<boolean>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SecureAuthService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SecureAuthService>;
}
