import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';

import { UserEntity } from './user.entity';
import * as entity from './comment.entity';

@Injectable({
  providedIn: 'root',
})
export class CommentUsecase {
  private commentsCollection: AngularFirestoreCollection<Comment>;

  constructor(private afs: AngularFirestore, private userEntity: UserEntity) {
    this.commentsCollection = afs.collection<Comment>('comments');
    this.userEntity.user$.subscribe(user => {
      if (user) {
        this.userEntity.uid = user.uid;
      }
    });
  }

  addComment(value: string): void {
    const comment: entity.Comment = {
      uid: this.userEntity.uid,
      comment: value,
    };
    this.commentsCollection.doc(this.userEntity.uid).set(comment);
  }
}
