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
import { CompilerResolverService } from '../../services/compiler-resolver';
import { CompilerType } from '../../utils/types/file-specification';

@Component({
  selector: 'app-preview-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-component.html',
  styleUrl: './preview-component.scss',
})
export class PreviewComponent {
  readonly compiler = inject(CompilerResolverService);

  @ViewChild('previewAnchor', { read: ViewContainerRef, static: true })
  readonly previewAnchor!: ViewContainerRef;

  public htmlCode = input.required<string>();
  public scssCode = input.required<string>();
  public tsCode = input.required<string>();
  public isCompiling = model(false);
  public errorMessage = signal<string | null>(null);
  public hasError = computed(() => this.errorMessage() !== null);

  private mountHandle: { dispose(): void } | null = null;

  constructor() {
    effect(async () => {
      if (!this.tsCode()) return;
      this.errorMessage.set(null);
      this.isCompiling.set(true);
      this.previewAnchor.clear();
      try {
        this.mountHandle = await this.compiler.compileComponentFromString(
          CompilerType.Angular,
          {
            typescript: this.tsCode(),
            html: this.htmlCode(),
            scss: this.scssCode(),
          },
          this.previewAnchor,
        );
      } catch (error) {
        this.previewAnchor.clear();
        this.errorMessage.set((error as Error).message);
      } finally {
        this.isCompiling.set(false);
      }
    });
  }
}
