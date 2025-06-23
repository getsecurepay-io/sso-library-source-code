import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CookieService } from './cookie.service';
import { HttpResponse, LoginData } from './model';

@Injectable({
  providedIn: 'root',
})
export class SSOAuthService {
  private baseAPI = 'https://secureauth.secureid-digital.com.ng/api';
  private signUpSubject = new Subject();
  private loginSubject = new Subject();
  private verifyEmailSubject = new Subject();
  private sendOTPSubject = new Subject<boolean>();
  private validateOTPSubject = new Subject();
  private forgotPasswordSubject = new Subject<boolean>();
  private resetPasswordSubject = new Subject<any>();

  constructor(
    private http: HttpClient,
    private readonly cookieStorage: CookieService
  ) {}

  // login(payload: { EmailAddress: string; Password: string }) {
  //   // Todo: handle login
  //   const encodedData = btoa(JSON.stringify(payload));

  //   let headers = new HttpHeaders();
  //   headers = headers.append('Basic', encodedData);

  //   this.http
  //     .post<LoginData>(`${this.baseAPI}/auth/authenticate`, {}, { headers })
  //     .subscribe({
  //       next: (res: LoginData) => {
  //         if (res['userId']) {
  //           this.setUserDetails(res);
  //           this.loginSubject.next(res);
  //         } else {
  //           const errorMessage = res['description'];
  //           this.loginSubject.next(errorMessage);
  //         }
  //       },
  //       error: (err) => {
  //         // scrollTo({ top: 0 });
  //         this.loginSubject.next(err['description']);
  //       },
  //     });

  //   return this.loginSubject.asObservable();
  // }

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
          this.signUpSubject.next(true);
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

  get redirectURL() {
    return this.cookieStorage.get('redirectUrl');
  }
}
