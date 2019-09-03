import {
  Component,
  OnInit,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';

import { Map, Marker } from './domains/map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private el: HTMLElement;
  map = new Map();

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.el = this.elementRef.nativeElement;
    const mapElem = this.el.querySelector('#map') as HTMLElement;

    this.map.initMap(mapElem);
  }
}
