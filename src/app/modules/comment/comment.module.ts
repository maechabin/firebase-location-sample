import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommentContainerComponent } from './container/comment.container';
import { InputComponent } from './components/input/input.component';

@NgModule({
  declarations: [CommentContainerComponent, InputComponent],
  imports: [CommonModule],
  exports: [CommentContainerComponent],
})
export class CommentModule {}
