import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AgGridModule } from 'ag-grid-angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { AppComponent } from './app.component';
import { FaButtonComponent } from '../components/fa-button/fa-button.component';
import { QuickFilterComponent } from 'src/components/quick-filter/quick-filter.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [AppComponent, FaButtonComponent, QuickFilterComponent],
  imports: [BrowserModule, HttpClientModule, AgGridModule, FontAwesomeModule, FormsModule, BrowserAnimationsModule, MatSlideToggleModule, ClipboardModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
