import { Type, ViewContainerRef } from '@angular/core';

export interface ICompiler<TResult> {
  transformAndCompileFiles(
    sourceFiles: Record<string, string>,
    moduleregistry: Record<string, any>,
  ): Promise<TResult>;

  mountComponent(
    component: Type<any>,
    anchorElement: ViewContainerRef | HTMLElement,
  ): Promise<{ dispose(): void }>;
}
