import { ViewContainerRef, Type, Injectable } from '@angular/core';
import { ICompiler } from '../utils/interfaces/iCompiler';

@Injectable({ providedIn: 'root' })
export class AngularCompilerService implements ICompiler<Type<any>> {
  private tsModule: typeof import('typescript') | null = null;
  private sassModule: typeof import('sass') | null = null;

  public async transformAndCompileFiles(
    sourceFiles: Record<string, string>,
    moduleregistry: Record<string, any>,
  ): Promise<Type<any>> {
    try {
      if (!this.tsModule) {
        const raw: any = await import('typescript');
        this.tsModule = raw.ModuleKind ? raw : raw.default;
      }
      const uniqueId = crypto.randomUUID();
      let tsCode = sourceFiles['typescript'];
      const css = await this._compileScssToCss(sourceFiles['scss']);
      // Modify the TypeScript code to include the unique ID in the component's metadata
      // We need this for reload css in browser when the component is re-rendered
      tsCode = tsCode.replace(
        /@Component\s*\(\s*\{/,
        `@Component({
        host: { 'data-preview-id': '${uniqueId}' },`,
      );
      // Replace templateUrl and styleUrl with inline template and styles
      // We need this because we need one file component to compile and render in browser
      tsCode = tsCode.replace(
        /templateUrl\s*:\s*['"`].*?['"`]\s*,?/,
        `template: \`${sourceFiles['html']}\`,`,
      );
      tsCode = tsCode.replace(
        /styleUrl\s*:\s*['"`].*?['"`]\s*,?/,
        `styles: [\`${css}\`],`,
      );

      const jsSource = this.tsModule!.transpileModule(tsCode, {
        compilerOptions: {
          module: this.tsModule!.ModuleKind.CommonJS,
          target: this.tsModule!.ScriptTarget.ES2024,
          experimentalDecorators: true,
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

      const componentClass = Object.values(exportsObj).find(
        (v) => typeof v === 'function',
      ) as Type<any>;

      if (!componentClass) throw new Error('No exported class was found.');

      return componentClass;
    } catch (error) {
      console.error('Error in transformAndCompileFiles:', error);
      throw error;
    }
  }

  public async mountComponent(
    component: Type<any>,
    anchorElement: ViewContainerRef,
  ): Promise<{ dispose(): void }> {
    try {
      // we need give function here to create component
      const componentRef = anchorElement.createComponent(component);
      componentRef.changeDetectorRef.detectChanges();
      return { dispose: () => componentRef.destroy() };
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
