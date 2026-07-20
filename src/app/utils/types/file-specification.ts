export type FileSpecification = {
  key: CompilerType;
  label: string;
  language: FileType;
  uri: string;
  icon: IconType;
};

export enum FileType {
  TypeScript = 'typescript',
  HTML = 'html',
  SCSS = 'scss',
}

export enum IconType {
  TypeScript = 'ts',
  HTML = 'html',
  SCSS = 'scss',
}

export enum CompilerType {
  Angular = 'angular',
  React = 'react',
}
