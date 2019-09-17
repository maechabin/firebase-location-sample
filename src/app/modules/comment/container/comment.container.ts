import { Component, OnInit } from '@angular/core';

import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

interface Comment {
  uid: string;
  comment: string;
  // lat: number;
  // lng: number;
  // date: number;
}

@Component({
  selector: 'app-comment',
  template: `
    <app-input
      (textInput)="handleTextInput($event)"
      (buttonClick)="handleButtonClick()"
      ><app-input> </app-input
    ></app-input>
  `,
})
export class CommentContainerComponent implements OnInit {
  private commentsCollection: AngularFirestoreCollection<Comment>;

  user$ = this.afAuth.user;
  comment: string;
  uid: string;

  constructor(public afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.commentsCollection = afs.collection<Comment>('comments');
  }

  ngOnInit() {
    this.user$.subscribe(user => {
      if (user) {
        console.log(user.uid);
        this.uid = user.uid;
      }
    });
  }

  addComment(value: string): void {
    const user = this.uid;
    const comment: Comment = {
      uid: user,
      comment: value,
    };
    this.commentsCollection.doc(user).set(comment);
  }

  handleTextInput(value: string) {
    this.comment = value;
  }
  handleButtonClick() {
    if (this.comment) {
      this.addComment(this.comment);
    }
  }
}
