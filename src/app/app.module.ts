import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { MapContainerComponent } from './map/container/map.container';
import { LLMapComponent } from './map/components/llmap/llmap.component';
import { LoginButtonComponent } from './map/components/login-button/login-button.component';
import { LocateButtonComponent } from './map/components/locate-button/locate-button.component';
import { MarkerListComponent } from './map/components/marker-list/marker-list.component';

@NgModule({
  declarations: [
    AppComponent,
    MapContainerComponent,
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
