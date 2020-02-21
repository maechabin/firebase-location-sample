import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Marker } from '../../../../../domains/llmap';

@Component({
  selector: 'app-marker-list',
  templateUrl: './marker-list.component.html',
  styleUrls: ['./marker-list.component.scss'],
})
export class MarkerListComponent {
  @Input() locationList: Marker[];
  @Input() colors: { ['box-shadow']: string }[];
  @Output() listClick = new EventEmitter<{ lat: number; lng: number }>();

  handleListClick($event: { lat: number; lng: number }) {
    this.listClick.emit($event);
  }
}
