import { Injectable, NgZone, inject } from '@angular/core';

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
}
