import { CommonModule } from '@angular/common';
import { Component, input, OnDestroy, signal, ViewChild } from '@angular/core';
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
  @ViewChild('editorPanel') private editorPanel!: MonacoEditorComponent;

  public tsPath = input.required<string>();
  public htmlPath = input<string>();
  public scssPath = input<string>();

  protected readonly editorPct = signal(50);
  protected codes = signal<{ html: string; scss: string; ts: string }>({
    html: '',
    scss: '',
    ts: '',
  });

  public ngOnDestroy(): void {}

  public onClickRun(): void {
    const tabsContent = this.editorPanel.getTabsContent();
    this.codes.set({
      html: tabsContent.html,
      scss: tabsContent.scss,
      ts: tabsContent.ts,
    });
  }
}
