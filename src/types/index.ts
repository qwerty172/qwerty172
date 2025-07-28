export interface CompilationResult {
  output: string;
  error: string;
  statusCode: number;
  memory: string;
  cpuTime: string;
}

export interface CodeGenerationResult {
  fileId: string;
  fileName: string;
  code: string;
  compilation: CompilationResult;
  downloadUrl: string;
}

export interface Language {
  value: string;
  label: string;
  icon: string;
  extension: string;
}