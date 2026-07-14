import { CommonModule } from '@angular/common';
import { Component, Injectable, Type } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import * as ts from 'typescript';
import * as sass from 'sass';

@Injectable({ providedIn: 'root' })
export class CompilerService {
  public compileComponentFromString(componentCode: string) {
    const jsSource = ts.transpileModule(componentCode, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        experimentalDecorators: true,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;

    const factory = new Function(
      'Component',
      'CommonModule',
      'MatTableModule',
      'exports',
      `${jsSource}`,
    );

    const exportsObj: Record<string, any> = {};

    factory(Component, CommonModule, MatTableModule, exportsObj);

    const componentClass = Object.values(exportsObj).find(
      (v) => typeof v === 'function',
    ) as Type<any>;

    if (!componentClass) throw new Error('No exported class was found.');

    return componentClass;
  }

  private async compileScssToCss(scssSource: string): Promise<string> {
    const result = await sass.compileStringAsync(scssSource);
    return result.css;
  }
}
