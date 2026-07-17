import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
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
  public isCompiling = model(false);
  public errorMessage = signal<string | null>(null);
  public hasError = computed(() => this.errorMessage() !== null);

  constructor() {
    effect(async () => {
      if (!this.tsCode()) return;
      this.errorMessage.set(null);
      this.isCompiling.set(true);
      this.previewAnchor.clear();
      try {
        const compiledJS = await this.compiler.compileComponentFromString(
          this.htmlCode(),
          this.scssCode(),
          this.tsCode(),
        );
        // we need give function here to create component
        const componentRef = this.previewAnchor.createComponent(compiledJS);
        componentRef.changeDetectorRef.detectChanges();
      } catch (error) {
        this.previewAnchor.clear();
        this.errorMessage.set((error as Error).message);
      } finally {
        this.isCompiling.set(false);
      }
    });
  }
}
