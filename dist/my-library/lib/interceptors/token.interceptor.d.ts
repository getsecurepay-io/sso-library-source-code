import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from '../cookie.service';
import * as i0 from "@angular/core";
export declare class TokenInterceptor implements HttpInterceptor {
    private cookieService;
    constructor(cookieService: CookieService);
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TokenInterceptor, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TokenInterceptor>;
}
