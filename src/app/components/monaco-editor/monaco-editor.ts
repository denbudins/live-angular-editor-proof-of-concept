import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  OnDestroy,
  signal,
  inject,
  input,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CodeSampleService, MonacoEditorService } from '../../services';
import {
  constrainedEditor,
  ConstrainedInstance,
  EditorRestriction,
} from 'constrained-editor-plugin';

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
  @ViewChild('editorHost') private hostEl!: ElementRef<HTMLDivElement>;

  public tsPath = input.required<string>();
  public htmlPath = input<string>();
  public scssPath = input<string>();

  private monacoEditorService = inject(MonacoEditorService);
  private componentSourceService = inject(CodeSampleService);

  protected readonly activeTab = signal<EditorTab>(TABS[0]);
  protected readonly tabs = TABS;

  private editor: any;
  private models: Record<string, any> = {};

  public async ngAfterViewInit(): Promise<void> {
    await this.monacoEditorService.load();
    await this.setInitEditorContent();
  }

  public ngOnDestroy(): void {
    this.editor?.dispose();
  }

  protected switchTab(tab: EditorTab): void {
    if (!this.editor || !this.models[tab.key]) return;
    this.activeTab.set(tab);
    this.editor.setModel(this.models[tab.key]);
    this.editor.focus();
  }

  public getTabsContent(): ComponentFiles {
    return {
      ts: this.models['ts']?.getValue() ?? '',
      html: this.models['html']?.getValue() ?? '',
      scss: this.models['scss']?.getValue() ?? '',
    };
  }

  private async setInitEditorContent(): Promise<void> {
    this.models = {
      ts: this.monacoEditorService.getOrCreateModel(
        TABS[0].uri,
        'typescript',
        await this.componentSourceService.fetchFile(this.tsPath()),
      ),
    };

    if (this.htmlPath()) {
      this.models['html'] = this.monacoEditorService.getOrCreateModel(
        TABS[1].uri,
        'html',
        await this.componentSourceService.fetchFile(this.htmlPath()!),
      );
    }
    if (this.scssPath()) {
      this.models['scss'] = this.monacoEditorService.getOrCreateModel(
        TABS[2].uri,
        'scss',
        await this.componentSourceService.fetchFile(this.scssPath()!),
      );
    }

    this.editor = this.monacoEditorService.createEditor(
      this.hostEl.nativeElement,
      this.models['ts'],
    );

    Object.values(this.models).forEach((model) =>
      this.monacoEditorService.applyEditableRegions(model),
    );
  }
}
