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
  protected componentCode = signal<string>('');

  public ngOnDestroy(): void {}

  public onClickRun(): void {
    const tabsContent = this.editorPanel.getTabsContent();
    const uniqueId = crypto.randomUUID();
    const match = tabsContent.ts.match(/export\s+class[\s\S]*/);
    if (!match) throw new Error('No `export class` was found in the code.');
    this.componentCode.set(`
    @Component({
      selector: 'app-preview',
      standalone: true,
      host: { 'data-preview-id': '${uniqueId}' },
      template: \`${tabsContent.html}\`,
      styles: [\`${tabsContent.scss}\`],
      imports: [CommonModule, MatTableModule],
    })
    ${match[0].trim()}`);
  }
}
