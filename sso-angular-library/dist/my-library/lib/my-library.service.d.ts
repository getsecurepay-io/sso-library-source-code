import { HttpClient } from '@angular/common/http';
import { CookieService } from './cookie.service';
import { Observable } from 'rxjs';
import * as i0 from "@angular/core";
export declare class MyLibraryService {
    private http;
    private readonly cookieStorage;
    private baseAPI;
    private signUpSubject;
    private loginSubject;
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
    initializeApp(query: any): Observable<any>;
    private setupApp;
    private appInit;
    login(payload: {
        EmailAddress: string;
        Password: string;
    }): Observable<unknown>;
    private setUserDetails;
    signup(payload: any): Observable<unknown>;
    verifyEmail(payload: {
        token: string;
        userId: string;
    }): Observable<unknown>;
    sendOTP(OtpType: number): Observable<boolean>;
    validateOTP(token: string): Observable<unknown>;
    forgotPassword(emailAddress: string): Observable<boolean>;
    resetPassword(payload: {
        password: string;
        confirmPassword: string;
        userId: string;
    }): Observable<any>;
    get redirectURL(): string | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyLibraryService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyLibraryService>;
}
