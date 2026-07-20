import { inject, Injectable, ViewContainerRef } from '@angular/core';
import { MODULE_REGISTRY } from '../utils/helpers/registry';
import { AngularCompilerService } from './angular-compailer';
import { CompilerType } from '../utils/types/file-specification';

@Injectable({ providedIn: 'root' })
export class CompilerResolverService {
  private angularCompilerService = inject(AngularCompilerService);

  public async compileComponentFromString(
    compiler: CompilerType,
    sourceFiles: Record<string, string>,
    anchorElement: ViewContainerRef,
  ): Promise<{ dispose(): void }> {
    try {
      switch (compiler) {
        case CompilerType.Angular:
          const componentClass =
            await this.angularCompilerService.transformAndCompileFiles(
              sourceFiles,
              MODULE_REGISTRY,
            );
          return this.angularCompilerService.mountComponent(
            componentClass,
            anchorElement,
          );
        default:
          throw new Error(`Unsupported compiler: ${compiler}`);
      }
    } catch (error) {
      throw error;
    }
  }
}
