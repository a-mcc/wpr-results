import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { ToastrModule } from 'ngx-toastr';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AgGridModule } from 'ag-grid-angular';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AgGridModule, FontAwesomeModule, FormsModule, MatSlideToggleModule, ClipboardModule, ToastrModule.forRoot({ positionClass: 'toast-top-center', timeOut: 2000 })),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
    ]
})
  .catch(err => console.error(err));
