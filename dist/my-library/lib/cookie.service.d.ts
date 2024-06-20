import * as i0 from "@angular/core";
export declare class CookieService {
    COOKIE_NAME: string;
    set(name: string, value: string, days?: number): void;
    get(name: string): string | null;
    remove(name: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CookieService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CookieService>;
}
