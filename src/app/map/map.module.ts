import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapContainerComponent } from './container/map.container';
import { LLMapComponent } from './components/llmap/llmap.component';
import { LoginButtonComponent } from './components/login-button/login-button.component';
import { LocateButtonComponent } from './components/locate-button/locate-button.component';
import { MarkerListComponent } from './components/marker-list/marker-list.component';

@NgModule({
  declarations: [
    MapContainerComponent,
    LLMapComponent,
    LoginButtonComponent,
    LocateButtonComponent,
    MarkerListComponent,
  ],
  imports: [CommonModule],
  exports: [MapContainerComponent],
})
export class MapModule {}
