import { NgModule } from '@angular/core';
import { MyLibraryComponent } from './my-library.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { TokenInterceptor } from './interceptors/token.interceptor';



@NgModule({
  declarations: [
    MyLibraryComponent
  ],
  imports: [
  ],
  exports: [
    MyLibraryComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
  ],
})
export class MyLibraryModule { }
