import { HttpClient } from '@angular/common/http';
import { CookieService } from './cookie.service';
import * as i0 from "@angular/core";
export declare class AppSetupService {
    private readonly http;
    private readonly cookieStorage;
    private baseUrl;
    private appIsSetup;
    private query;
    constructor(http: HttpClient, cookieStorage: CookieService);
    initializeApp(query?: any): void | {
        title: string;
        message: string;
        type: string;
    };
    private appInit;
    private setupApp;
    static ɵfac: i0.ɵɵFactoryDeclaration<AppSetupService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AppSetupService>;
}
