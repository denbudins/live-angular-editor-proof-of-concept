declare module 'constrained-editor-plugin' {
  export interface EditorRestriction {
    range: [number, number, number, number]; // [startLine, startColumn, endLine, endColumn]
    label?: string;
    allowMultiline?: boolean;
    validate?: (
      currentlyTypedValue: string,
      newRange: [number, number, number, number],
      info: { label?: string },
    ) => boolean;
  }

  export interface ConstrainedInstance {
    initializeIn(editorInstance: any): boolean;
    addRestrictionsTo(model: any, restrictions: EditorRestriction[]): any;
    removeRestrictionsIn(model: any): void;
    disposeConstrainer(editorInstance: any): void;
    toggleDevMode(on: boolean): void;
  }

  export function constrainedEditor(monaco: any): ConstrainedInstance;
}
