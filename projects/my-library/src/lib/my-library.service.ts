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
  // baseAPI = 'https://secureauth.secureid-digital.com.ng/api';
  // private baseAPI = environment.baseAPI;
  private signUpSubject = new Subject();
  private loginSubject = new Subject();
  private appSetupSubject = new Subject();
  private verifyEmailSubject = new Subject();
  private sendOTPSubject = new Subject<boolean>();
  private validateOTPSubject = new Subject();
  private forgotPasswordSubject = new Subject<boolean>();
  private resetPasswordSubject = new Subject<any>();
  private queryObject: any;

  emailValidationRegex = /([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)+/
  passwordValidationRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])[A-Za-z\d`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]{8,100000}$/
  phoneNumberValidationRegex = /^0\d{8,10}$/

  constructor(
    private http: HttpClient,
    private readonly cookieStorage: CookieService
  ) {}

  checkForSpecialCharacters(query: string) {
    const pattern = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return pattern.test(query)
  }

  checkForDigits(query: string) {
    const pattern = /\d/;
    return pattern.test(query)
  }

  checkForLowercase(query: string) {
    const pattern = /[a-z]/;
    return pattern.test(query)
  }

  checkForUppercase(query: string) {
    const pattern = /[A-Z]/;
    return pattern.test(query)
  }

  initializeApp(query: {params: string, url: string}): Observable<any> {
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
    this.cookieStorage.set('sso', this.baseAPI)
    this.cookieStorage.set('appParams', appParams);
    // this.cookieStorage.set('role', role);
    return this.appInit();
  }

  private appInit(): Observable<any> {
    const accessToken = this.cookieStorage.get('appParams') || '';
    let headers = new HttpHeaders();
    headers = headers.append('Basic', accessToken);

    this.http.post<AppParams>(`${this.baseAPI}/auth/get-token`, {}, { headers })
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
    // Todo: handle login
    const encodedData = btoa(JSON.stringify(payload));

    this.cookieStorage.remove('token')

    let headers = new HttpHeaders();
    headers = headers.append('Basic', encodedData);

    this.http
      .post<LoginData>(`${this.baseAPI}/auth/authenticate`, {}, { headers })
      .subscribe({
        next: (res: LoginData) => {
          if (res['userId']) {
            this.setUserDetails(res);
            const userData =  (res as LoginData)
            this.loginSubject.next(userData);
          } else {
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
    this.http.post(`${this.baseAPI}/auth/register`, payload).subscribe({
      next: (res: any) => {
        if (res['data']) {
          this.signUpSubject.next(res);
        } else {
          const errorMessage = res['description'];
          this.signUpSubject.next(errorMessage);
        }
      },
      error: (err: any) => {
        // scrollTo({ top: 0 });
        this.signUpSubject.next(err['description']);
      },
    });

    return this.signUpSubject.asObservable();
  }

  verifyEmail(payload: { token: string; userId: string }) {
    this.http.post(`${this.baseAPI}/auth/Confirm-Email`, payload).subscribe({
      next: (res: any) => {
        if (res['userId']) {
          this.verifyEmailSubject.next(true);
        } else {
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

  sendOTP(OtpType: number) {
    const userId = this.cookieStorage.get('userId');
    if (userId) {
      const payload = {
        OtpType,
        userId,
      };
      this.http
        .post<HttpResponse<string>>(`${this.baseAPI}/otp/send-otp`, payload)
        .subscribe({
          next: (res: any) => {
            // scrollTo({ top: 0 });
            if (res['userId']) {
              this.sendOTPSubject.next(true);
            } else {
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

  validateOTP(token: string) {
    const userId = this.cookieStorage.get('userId');

    if (userId) {
      const payload = {
        token,
        userId,
      };
      this.http
        .post<LoginData>(`${this.baseAPI}/otp/validate-otp`, payload)
        .subscribe({
          next: (res) => {
            // scrollTo({ top: 0 });
            if (res['token']) {
              this.setUserDetails(res);
              this.validateOTPSubject.next(res);
            } else {
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

  forgotPassword(emailAddress: string) {
    const payload = {
      emailAddress,
    };
    this.http
      .post<HttpResponse<LoginData>>(
        `${this.baseAPI}/auth/forgot-password`,
        payload
      )
      .subscribe({
        next: (res: any) => {
          if (res['data']) {
            this.setUserDetails(res.data);
            this.forgotPasswordSubject.next(true);
          } else {
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

  resetPassword(payload: {
    password: string;
    confirmPassword: string;
    userId: string;
  }) {
    this.http
      .post<LoginData>(`${this.baseAPI}/auth/reset-password`, payload)
      .subscribe({
        next: (res) => {
          if (res['data'] === 'Password reset successful.') {
            this.setUserDetails(res.data);
            this.resetPasswordSubject.next(true);
          } else {
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

  private get redirectURL() {
    return this.cookieStorage.get('redirectUrl');
  }
}
