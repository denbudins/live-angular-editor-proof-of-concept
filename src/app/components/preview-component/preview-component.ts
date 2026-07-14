import {
  Component,
  effect,
  inject,
  input,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompilerService, MonacoEditorService } from '../../services';

@Component({
  selector: 'app-preview-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-component.html',
  styleUrl: './preview-component.scss',
})
export class PreviewComponent {
  readonly compiler = inject(CompilerService);

  @ViewChild('previewAnchor', { read: ViewContainerRef, static: true })
  readonly previewAnchor!: ViewContainerRef;

  public code = input.required<string>();

  constructor() {
    effect(() => {
      if (!this.code()) return;
      this.previewAnchor.clear();
      const compiledJS = this.compiler.compileComponentFromString(this.code());
      this.previewAnchor.createComponent(compiledJS);
    });
  }
}
