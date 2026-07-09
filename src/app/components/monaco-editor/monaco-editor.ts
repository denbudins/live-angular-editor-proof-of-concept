import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  OnDestroy,
  signal,
  inject,
} from '@angular/core';
import { MonacoEditorService } from '../../services';

export interface ComponentFiles {
  ts: string; // component.ts
  html: string; // component.html
  scss: string; // component.scss
}

interface EditorTab {
  key: keyof ComponentFiles;
  label: string;
  language: 'typescript' | 'html' | 'scss';
  uri: string;
  icon: 'ts' | 'html' | 'scss';
}

const TABS: EditorTab[] = [
  {
    key: 'ts',
    label: 'preview.component.ts',
    language: 'typescript',
    uri: 'file:///preview.component.ts',
    icon: 'ts',
  },
  {
    key: 'html',
    label: 'preview.component.html',
    language: 'html',
    uri: 'file:///preview.component.html',
    icon: 'html',
  },
  {
    key: 'scss',
    label: 'preview.component.scss',
    language: 'scss',
    uri: 'file:///preview.component.scss',
    icon: 'scss',
  },
];

@Component({
  selector: 'app-monaco-editor',
  imports: [CommonModule],
  templateUrl: './monaco-editor.html',
  styleUrl: './monaco-editor.scss',
})
export class MonacoEditorComponent implements AfterViewInit, OnDestroy {
  private monacoEditorService = inject(MonacoEditorService);

  protected readonly activeTab = signal<EditorTab>(TABS[0]);
  protected readonly tabs = TABS;

  private editor: any;

  public ngAfterViewInit(): void {
    this.monacoEditorService.load(() => this.setInitEditorContent());
  }

  public ngOnDestroy(): void {
    this.editor?.dispose();
  }

  protected switchTab(tab: EditorTab): void {}

  private async setInitEditorContent(): Promise<void> {}
}
