import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class State {
  private IsSharing = false;

  get isSharing(): boolean {
    return this.IsSharing;
  }

  set isSharing(isSharing: boolean) {
    this.IsSharing = isSharing;
  }
}
