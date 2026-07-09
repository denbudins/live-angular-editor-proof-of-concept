import { Injectable, NgZone, inject } from '@angular/core';

export type EditorLanguage = 'typescript' | 'html' | 'scss';

@Injectable({ providedIn: 'root' })
export class MonacoEditorService {
  private zone = inject(NgZone);
  private _ready = false;
  private _onReady: (() => void)[] = [];

  load(onReady: () => void): void {
    if (this._ready) {
      onReady();
      return;
    }
    this._onReady.push(onReady);
    if ((window as any)._monacoLoading) return;
    (window as any)._monacoLoading = true;

    (window as any).MonacoEnvironment = {
      getWorkerUrl(_: string, label: string): string {
        const base = '/assets/monaco-editor/vs';
        if (label === 'typescript' || label === 'javascript')
          return `${base}/language/typescript/ts.worker.js`;
        if (label === 'css' || label === 'scss')
          return `${base}/language/css/css.worker.js`;
        if (label === 'html') return `${base}/language/html/html.worker.js`;
        return `${base}/editor/editor.worker.js`;
      },
    };

    (window as any).require = { paths: { vs: '/assets/monaco-editor/vs' } };

    const script = document.createElement('script');
    script.src = '/assets/monaco-editor/vs/loader.js';
    script.onload = () => {
      (window as any).require(['vs/editor/editor.main'], () => {
        this.zone.run(() => {
          this.configureTypeScript();
          this._ready = true;
          this._onReady.forEach((cb) => cb());
          this._onReady = [];
        });
      });
    };
    document.head.appendChild(script);
  }

  private configureTypeScript(): void {
    const ts = (window as any).monaco.languages.typescript;

    ts.typescriptDefaults.setCompilerOptions({
      target: ts.ScriptTarget.ES2022,
      allowNonTsExtensions: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      strict: false,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      module: ts.ModuleKind.CommonJS,
    });

    ts.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      diagnosticCodesToIgnore: [2307, 2304, 2339, 2345, 2554, 1219],
    });
  }
}
