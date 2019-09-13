import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { LLMapComponent } from './components/llmap/llmap.component';
import { LoginButtonComponent } from './components/login-button/login-button.component';
import { LocateButtonComponent } from './components/locate-button/locate-button.component';
import { MarkerListComponent } from './components/marker-list/marker-list.component';

@NgModule({
  declarations: [
    AppComponent,
    LLMapComponent,
    LoginButtonComponent,
    LocateButtonComponent,
    MarkerListComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AngularFireModule.initializeApp(environment.firebase),
  ],
  providers: [AngularFirestore, AngularFireAuth],
  bootstrap: [AppComponent],
})
export class AppModule {}
