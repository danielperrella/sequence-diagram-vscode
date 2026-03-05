import * as os from "node:os";
import * as path from "node:path";
import * as vscode from "vscode";
import { ScopedLogger } from "../logging/logger";
import { RenderFormat } from "../protocol";
import { decodeDataUrl } from "../utils/dataUrl";

export interface SaveDialogService {
  showSaveDialog(options: vscode.SaveDialogOptions): Thenable<vscode.Uri | undefined>;
}

export interface FileSystemService {
  writeFile(uri: vscode.Uri, content: Uint8Array): Thenable<void>;
}

export class DiagramExportService {
  public constructor(
    private readonly saveDialogService: SaveDialogService,
    private readonly fileSystemService: FileSystemService,
    private readonly logger: ScopedLogger
  ) {}

  public async exportFromDataUrl(
    documentUri: vscode.Uri,
    format: RenderFormat,
    dataUrl: string
  ): Promise<vscode.Uri | undefined> {
    const selectedUri = await this.saveDialogService.showSaveDialog({
      defaultUri: getDefaultExportUri(documentUri, format),
      filters:
        format === "svg"
          ? { SVG: ["svg"] }
          : { PNG: ["png"] }
    });

    if (!selectedUri) {
      this.logger.info("Export canceled by user.");
      return undefined;
    }

    const payload = decodeDataUrl(dataUrl);
    await this.fileSystemService.writeFile(selectedUri, payload);
    this.logger.info(`Exported ${format.toUpperCase()} diagram to ${selectedUri.fsPath}.`);

    return selectedUri;
  }
}

export function getDefaultExportUri(documentUri: vscode.Uri, format: RenderFormat): vscode.Uri {
  if (documentUri.scheme === "untitled") {
    const baseDirectory = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? os.homedir();
    return vscode.Uri.file(path.join(baseDirectory, `diagram.${format}`));
  }

  const basePath = documentUri.fsPath.replace(/\.seqdiag$/i, "");
  return vscode.Uri.file(`${basePath}.${format}`);
}
