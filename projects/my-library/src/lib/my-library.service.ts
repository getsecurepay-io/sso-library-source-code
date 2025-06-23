import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from './cookie.service';
import { AppParams, HttpResponse, LoginData } from './model';
import { Observable, Subject } from 'rxjs';
// import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MyLibraryService {
  baseAPI = '';
  private signUpSubject = new Subject();
  private loginSubject = new Subject();
  private appSetupSubject = new Subject();
  private verifyEmailSubject = new Subject();
  private sendOTPSubject = new Subject<boolean>();
  private validateOTPSubject = new Subject();
  private forgotPasswordSubject = new Subject<boolean>();
  private resetPasswordSubject = new Subject<any>();
  private queryObject: any;

  emailValidationRegex =
    /([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)+/;
  passwordValidationRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])[A-Za-z\d`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]{8,100000}$/;
  phoneNumberValidationRegex = /^0\d{8,10}$/;

  constructor(
    private http: HttpClient,
    private readonly cookieStorage: CookieService
  ) {}

  checkForSpecialCharacters(query: string) {
    const pattern = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return pattern.test(query);
  }

  checkForDigits(query: string) {
    const pattern = /\d/;
    return pattern.test(query);
  }

  checkForLowercase(query: string) {
    const pattern = /[a-z]/;
    return pattern.test(query);
  }

  checkForUppercase(query: string) {
    const pattern = /[A-Z]/;
    return pattern.test(query);
  }

  private get headers(): HttpHeaders {
    let headers = new HttpHeaders();
    const accessToken = this.cookieStorage.get(this.cookieStorage.COOKIE_NAME);
    const tokenType = this.cookieStorage.get('tokenType');
    headers = headers.append('Authorization', `${tokenType} ${accessToken}`);

    return headers;
  }

  initializeApp(query: { params: string; url: string }): Observable<any> {
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

  private appInit(): Observable<any> {
    const accessToken = this.cookieStorage.get('appParams') || '';
    let headers = new HttpHeaders();
    headers = headers.append('Basic', accessToken);

    this.http
      .post<AppParams>(`${this.baseAPI}/auth/get-token`, {}, { headers })
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

  private setupApp(data: AppParams) {
    // this.appIsSetup = true;
    this.cookieStorage.remove('appParams');
    this.cookieStorage.set(
      'redirectUrl',
      data.client.redirectUri,
      data.expiresIn
    );
    this.cookieStorage.set('accessToken', data.accessToken, data.expiresIn);
    this.cookieStorage.set('tokenType', data.tokenType, data.expiresIn);
    this.appSetupSubject.next({
      title: 'Success',
      message: 'Items saved to cookies storage',
      type: 'success',
      queryObject: this.queryObject,
    });
  }

  login(payload: { EmailAddress: string; Password: string }) {
    console.log('Yeah, logging works:', payload);

    // Todo: handle login
    const encodedData = btoa(JSON.stringify(payload));
    let headers = this.headers;
    headers = headers.append('Basic', encodedData);

    this.http
      .post<LoginData>(`${this.baseAPI}/auth/authenticates`, {}, { headers })
      .subscribe({
        next: (res: LoginData) => {
          console.log(res);
          if (res['userId']) {
            this.setUserDetails(res);
            const userData = res as LoginData;
            this.loginSubject.next(userData);
            this.loginSubject.complete();
          } else {
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
  private setUserDetails(data: any) {
    for (const key in data) {
      if (data[key]) {
        if (typeof data[key] === 'object') {
          this.cookieStorage.set(key, JSON.stringify(data[key]));
        } else {
          this.cookieStorage.set(key, data[key]);
        }
      }
    }
  }

  signup(payload: any) {
    let headers = this.headers;
    this.http
      .post(`${this.baseAPI}/auth/register`, payload, { headers })
      .subscribe({
        next: (res: any) => {
          if (res['data']) {
            this.signUpSubject.next(res);
          } else {
            const errorMessage = res?.description || 'Failed';
            this.signUpSubject.next(errorMessage);
          }
        },
        error: (err: any) => {
          // scrollTo({ top: 0 });
          this.signUpSubject.next(err?.description || 'Failed');
        },
      });

    return this.signUpSubject.asObservable();
  }

  verifyEmail(payload: { token: string; userId: string }) {
    let headers = this.headers;

    this.http
      .post(`${this.baseAPI}/auth/Confirm-Email`, payload, { headers })
      .subscribe({
        next: (res: any) => {
          if (res['userId']) {
            this.verifyEmailSubject.next(true);
          } else {
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

  sendOTP(OtpType: number) {
    let headers = this.headers;
    const userId = this.cookieStorage.get('userId');
    if (userId) {
      const payload = {
        OtpType,
        userId,
      };
      this.http
        .post<HttpResponse<string>>(`${this.baseAPI}/otp/send-otp`, payload, {
          headers,
        })
        .subscribe({
          next: (res: any) => {
            // scrollTo({ top: 0 });
            if (res['userId']) {
              this.sendOTPSubject.next(true);
            } else {
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

  validateOTP(token: string) {
    const userId = this.cookieStorage.get('userId');

    if (userId) {
      const payload = {
        token,
        userId,
      };
      let headers = this.headers;
      this.http
        .post<LoginData>(`${this.baseAPI}/otp/validate-otp`, payload, {
          headers,
        })
        .subscribe({
          next: (res) => {
            // scrollTo({ top: 0 });
            if (res['token']) {
              this.setUserDetails(res);
              this.validateOTPSubject.next(res);
            } else {
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

  forgotPassword(emailAddress: string) {
    const payload = {
      emailAddress,
    };
    let headers = this.headers;
    this.http
      .post<HttpResponse<LoginData>>(
        `${this.baseAPI}/auth/forgot-password`,
        payload,
        { headers }
      )
      .subscribe({
        next: (res: any) => {
          if (res['data']) {
            this.setUserDetails(res.data);
            this.forgotPasswordSubject.next(true);
          } else {
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

  resetPassword(payload: {
    password: string;
    confirmPassword: string;
    userId: string;
  }) {
    let headers = this.headers;
    this.http
      .post<LoginData>(`${this.baseAPI}/auth/reset-password`, payload, {
        headers,
      })
      .subscribe({
        next: (res) => {
          if (res['data'] === 'Password reset successful.') {
            this.setUserDetails(res.data);
            this.resetPasswordSubject.next(true);
          } else {
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
}
