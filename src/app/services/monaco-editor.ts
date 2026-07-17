import { Injectable, NgZone, inject } from '@angular/core';
import {
  constrainedEditor,
  ConstrainedInstance,
  EditorRestriction,
} from 'constrained-editor-plugin';

export type EditorLanguage = 'typescript' | 'html' | 'scss';

interface MonacoGlobal {
  languages: {
    typescript: {
      typescriptDefaults: {
        setCompilerOptions(options: Record<string, unknown>): void;
        setDiagnosticsOptions(options: Record<string, unknown>): void;
      };
      ScriptTarget: Record<string, number>;
      ModuleResolutionKind: Record<string, number>;
      ModuleKind: Record<string, number>;
    };
  };
}

declare global {
  interface Window {
    monaco?: MonacoGlobal;
    MonacoEnvironment?: {
      getWorkerUrl(moduleId: string, label: string): string;
    };
    require?: ((deps: string[], callback: () => void) => void) & {
      config?: (opts: { paths: Record<string, string> }) => void;
    };
  }
}

const MONACO_BASE_PATH = '/assets/monaco-editor/vs';

const WORKER_PATHS: Record<string, string> = {
  typescript: `${MONACO_BASE_PATH}/language/typescript/ts.worker.js`,
  javascript: `${MONACO_BASE_PATH}/language/typescript/ts.worker.js`,
  css: `${MONACO_BASE_PATH}/language/css/css.worker.js`,
  scss: `${MONACO_BASE_PATH}/language/css/css.worker.js`,
  html: `${MONACO_BASE_PATH}/language/html/html.worker.js`,
};
const DEFAULT_WORKER_PATH = `${MONACO_BASE_PATH}/editor/editor.worker.js`;

@Injectable({ providedIn: 'root' })
export class MonacoEditorService {
  private zone = inject(NgZone);
  private loadPromise: Promise<MonacoGlobal> | null = null;
  private constrainedInstance: ConstrainedInstance | null = null;
  private restrictedUris = new Set<string>();

  public async load(): Promise<MonacoGlobal> {
    if (!this.loadPromise) {
      this.loadPromise = this.loadInternal();
    }
    return this.loadPromise;
  }

  public createEditor(container: HTMLElement, model: any): any {
    const editor = (window as any).monaco.editor.create(container, {
      model,
      theme: 'vs-dark',
      fontSize: 13,
      lineHeight: 21,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontLigatures: true,
      minimap: { enabled: true, scale: 0.8 },
      padding: { top: 12, bottom: 12 },
      smoothScrolling: true,
      cursorSmoothCaretAnimation: 'on',
      cursorBlinking: 'smooth',
      scrollBeyondLastLine: false,
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true },
      folding: true,
      scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
    });

    this.constrainedInstance = constrainedEditor((window as any).monaco);
    this.constrainedInstance.initializeIn(editor);

    new ResizeObserver(() => editor.layout()).observe(container);
    return editor;
  }

  public getOrCreateModel(
    uri: string,
    language: EditorLanguage,
    value: string,
  ): any {
    const m = (window as any).monaco;
    const key = m.Uri.parse(uri);
    return m.editor.getModel(key) ?? m.editor.createModel(value, language, key);
  }

  public applyEditableRegions(model: any): void {
    if (!this.constrainedInstance) return;

    const uriKey = model.uri.toString();
    if (this.restrictedUris.has(uriKey)) return;

    const restrictions = this.computeEditableRestrictions(model);
    if (restrictions.length) {
      this.constrainedInstance.addRestrictionsTo(model, restrictions);
      this.restrictedUris.add(uriKey);
      this.highlightReadOnlyRegions(model, restrictions);
    }
  }

  private computeEditableRestrictions(model: any): EditorRestriction[] {
    const lines: string[] = model.getValue().split('\n');
    const restrictions: EditorRestriction[] = [];

    let startLine: number | null = null;

    lines.forEach((line: string, index: number) => {
      const lineNumber = index + 1;

      if (line.includes('@editable:start')) {
        startLine = lineNumber + 1;
        return;
      }

      if (line.includes('@editable:end') && startLine !== null) {
        const endLine = lineNumber - 1;
        const endColumn = (lines[endLine - 1]?.length ?? 0) + 1;

        restrictions.push({
          range: [startLine, 1, endLine, endColumn],
          allowMultiline: true,
          label: `editable-${restrictions.length}`,
        });
        startLine = null;
      }
    });

    return restrictions;
  }

  private loadInternal(): Promise<MonacoGlobal> {
    return new Promise<MonacoGlobal>((resolve, reject) => {
      window.MonacoEnvironment = {
        getWorkerUrl: (_moduleId: string, label: string) =>
          WORKER_PATHS[label] ?? DEFAULT_WORKER_PATH,
      };

      window.require = Object.assign(
        (deps: string[], callback: () => void) => {},
        { config: undefined as any },
      );
      (window as any).require = { paths: { vs: MONACO_BASE_PATH } };

      const script = document.createElement('script');
      script.src = `${MONACO_BASE_PATH}/loader.js`;

      script.onerror = () => {
        this.loadPromise = null;
        reject(new Error(`Can't load Monaco loader from ${script.src}`));
      };

      script.onload = () => {
        window.require!(['vs/editor/editor.main'], () => {
          this.zone.run(() => {
            const monaco = window.monaco!;
            this.configureTypeScript(monaco);
            resolve(monaco);
          });
        });
      };

      document.head.appendChild(script);
    });
  }

  private configureTypeScript(monaco: MonacoGlobal): void {
    const ts = monaco.languages.typescript;

    ts.typescriptDefaults.setCompilerOptions({
      target: ts.ScriptTarget['ES2022'],
      allowNonTsExtensions: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      strict: false,
      moduleResolution: ts.ModuleResolutionKind['NodeJs'],
      module: ts.ModuleKind['CommonJS'],
    });

    ts.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      diagnosticCodesToIgnore: [2307, 2304, 2339, 2345, 2554, 1219],
    });
  }

  private highlightReadOnlyRegions(
    model: any,
    editableRestrictions: EditorRestriction[],
  ): void {
    const monaco = (window as any).monaco;
    const totalLines = model.getLineCount();

    const sorted = [...editableRestrictions].sort(
      (a, b) => a.range[0] - b.range[0],
    );

    const readOnlyRanges: any[] = [];
    let cursor = 1;

    for (const { range } of sorted) {
      const [startLine, , endLine] = range;
      if (startLine > cursor) {
        readOnlyRanges.push(new monaco.Range(cursor, 1, startLine - 1, 1));
      }
      cursor = endLine + 1;
    }
    if (cursor <= totalLines) {
      readOnlyRanges.push(new monaco.Range(cursor, 1, totalLines, 1));
    }

    const decorations = readOnlyRanges.map((range) => ({
      range,
      options: {
        isWholeLine: true,
        className: 'readonly-region-line',
        linesDecorationsClassName: 'readonly-region-gutter',
      },
    }));

    model._readonlyDecorationIds = model.deltaDecorations(
      model._readonlyDecorationIds ?? [],
      decorations,
    );
  }
}
