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

  public htmlCode = input.required<string>();
  public scssCode = input.required<string>();
  public tsCode = input.required<string>();

  constructor() {
    effect(async () => {
      if (!this.tsCode()) return;
      this.previewAnchor.clear();
      const compiledJS = await this.compiler.compileComponentFromString(
        this.htmlCode(),
        this.scssCode(),
        this.tsCode(),
      );
      this.previewAnchor.createComponent(compiledJS);
    });
  }
}
