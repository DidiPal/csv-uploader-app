import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CsvUploaderComponent } from './csv-uploader/csv-uploader.component';
import { CsvUploaderService } from './services/csv-uploader.service';

@NgModule({
  declarations: [
    AppComponent,
    CsvUploaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [CsvUploaderService],
  bootstrap: [AppComponent]
})
export class AppModule { }