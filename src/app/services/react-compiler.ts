import { Injectable } from '@angular/core';
import { ICompiler } from '../utils/interfaces/iCompiler';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import * as JsxRuntime from 'react/jsx-runtime';

@Injectable({ providedIn: 'root' })
export class ReactCompilerService implements ICompiler<
  React.ComponentType<any>
> {
  private tsModule: typeof import('typescript') | null = null;
  private sassModule: typeof import('sass') | null = null;
  private root: Root | null = null;

  public async transformAndCompileFiles(
    sourceFiles: Record<string, string>,
    moduleregistry: Record<string, any>,
  ): Promise<React.ComponentType<any>> {
    try {
      if (!this.tsModule) {
        this.tsModule = await import('typescript');
      }
      const tsCode = sourceFiles['typescript'];

      const jsSource = this.tsModule.transpileModule(tsCode, {
        compilerOptions: {
          module: this.tsModule.ModuleKind.CommonJS,
          target: this.tsModule.ScriptTarget.ES2024,
          jsx: this.tsModule.JsxEmit.ReactJSX,
        },
      }).outputText;

      const factory = new Function('require', 'exports', jsSource);

      const require = (moduleName: string) => {
        const mod = moduleregistry[moduleName];
        if (!mod) throw new Error(`Module "${moduleName}" is not allowed.`);
        return mod;
      };

      const exportsObj: Record<string, any> = {};
      factory(require, exportsObj);

      const componentClass =
        exportsObj['default'] ?? Object.values(exportsObj)[0];

      if (!componentClass) throw new Error('No exported class was found.');

      return componentClass;
    } catch (error) {
      throw error;
    }
  }

  public async mountComponent(
    component: React.ComponentType<any>,
    anchorElement: HTMLElement,
  ): Promise<{ dispose(): void }> {
    try {
      this.root = createRoot(anchorElement);
      this.root.render(React.createElement(component));
      return {
        dispose: () => {
          this.root?.unmount();
          this.root = null;
        },
      };
    } catch (error) {
      throw error;
    }
  }

  private async _compileScssToCss(scssSource: string): Promise<string> {
    try {
      if (!this.sassModule) {
        this.sassModule = await import('sass');
      }

      const result = await this.sassModule.compileStringAsync(scssSource);
      return result.css;
    } catch (error) {
      throw error;
    }
  }
}
