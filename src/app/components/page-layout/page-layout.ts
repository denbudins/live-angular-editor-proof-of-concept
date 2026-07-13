import { CommonModule } from '@angular/common';
import { Component, input, OnDestroy, signal } from '@angular/core';
import { MonacoEditorComponent } from '../monaco-editor/monaco-editor';
import { EditorStatusBarComponent } from '../editor-status-bar/editor-status-bar';
import { PreviewComponent } from '../preview-component/preview-component';

@Component({
  selector: 'app-live-editor',
  imports: [
    CommonModule,
    MonacoEditorComponent,
    EditorStatusBarComponent,
    PreviewComponent,
  ],
  templateUrl: './page-layout.html',
  styleUrl: './page-layout.scss',
})
export class LiveEditorComponent implements OnDestroy {
  public tsPath = input.required<string>();
  public htmlPath = input<string>();
  public scssPath = input<string>();

  protected readonly editorPct = signal(50);

  public ngOnDestroy(): void {}
}
