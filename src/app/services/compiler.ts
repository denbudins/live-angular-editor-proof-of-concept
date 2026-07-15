import { Injectable, Type } from '@angular/core';
import * as ts from 'typescript';
import { MODULE_REGISTRY } from '../utils/helpers/registry';

@Injectable({ providedIn: 'root' })
export class CompilerService {
  private sassModule: typeof import('sass') | null = null;

  public async compileComponentFromString(
    htmlCode: string,
    scssCode: string,
    tsCode: string,
  ) {
    const uniqueId = crypto.randomUUID();
    const css = await this.compileScssToCss(scssCode);
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
      `template: \`${htmlCode}\`,`,
    );
    tsCode = tsCode.replace(
      /styleUrl\s*:\s*['"`].*?['"`]\s*,?/,
      `styles: [\`${css}\`],`,
    );

    const jsSource = ts.transpileModule(tsCode, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2024,
        experimentalDecorators: true,
      },
    }).outputText;

    const factory = new Function('require', 'exports', jsSource);

    const require = (moduleName: string) => {
      const mod = MODULE_REGISTRY[moduleName];
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
  }

  private async compileScssToCss(scssSource: string): Promise<string> {
    if (!this.sassModule) {
      this.sassModule = await import('sass');
    }

    const result = await this.sassModule.compileStringAsync(scssSource);
    return result.css;
  }
}
