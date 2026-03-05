export class Disposable {
  public constructor(private readonly callback: () => void = () => undefined) {}

  public dispose(): void {
    this.callback();
  }
}

export const window = {
  createOutputChannel: () => ({
    appendLine: () => undefined,
    dispose: () => undefined
  }),
  showErrorMessage: async () => undefined,
  showWarningMessage: async () => undefined,
  showInformationMessage: async () => undefined,
  showSaveDialog: async () => undefined
};

export const workspace = {
  workspaceFolders: [],
  getConfiguration: () => ({
    get: <T>(_key: string, defaultValue: T) => defaultValue
  }),
  fs: {
    writeFile: async () => undefined
  }
};

export const Uri = {
  file: (fsPath: string) => ({ fsPath, scheme: "file", path: fsPath }),
  joinPath: (...segments: Array<{ path?: string } | string>) => ({
    path: segments.map((segment) => (typeof segment === "string" ? segment : segment.path ?? "")).join("/")
  })
};

export const ConfigurationTarget = {
  Global: 1
};
