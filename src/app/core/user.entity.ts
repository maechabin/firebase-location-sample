import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class UserEntity {
  readonly user$ = this.afAuth.user;

  private Uid: string;

  get uid() {
    return this.Uid;
  }

  set uid(uid: string) {
    this.Uid = uid;
  }

  constructor(public afAuth: AngularFireAuth) {}
}
