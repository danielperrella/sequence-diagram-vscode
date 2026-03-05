import * as vscode from "vscode";
import { appLogger } from "../logging/logger";
import { SequenceDiagramPreviewController } from "../preview/SequenceDiagramPreviewController";

export function registerExportCommands(
  previewController: SequenceDiagramPreviewController
): vscode.Disposable {
  const logger = appLogger.child("Commands");

  return vscode.Disposable.from(
    vscode.commands.registerCommand("sequencediagram.exportSvg", async () => {
      logger.info("Export SVG command invoked.");
      const completed = await previewController.exportDiagram("svg");
      if (!completed) {
        logger.warn("Export SVG requested without an active .seqdiag preview context.");
        void vscode.window.showWarningMessage(
          "Open a .seqdiag file and toggle preview before exporting."
        );
        return;
      }
    }),
    vscode.commands.registerCommand("sequencediagram.exportPng", async () => {
      logger.info("Export PNG command invoked.");
      const completed = await previewController.exportDiagram("png");
      if (!completed) {
        logger.warn("Export PNG requested without an active .seqdiag preview context.");
        void vscode.window.showWarningMessage(
          "Open a .seqdiag file and toggle preview before exporting."
        );
        return;
      }
    }),
    vscode.commands.registerCommand("sequencediagram.reloadPreview", async () => {
      logger.info("Reload preview command invoked.");
      const completed = await previewController.reloadPreview();
      if (!completed) {
        logger.warn("Reload preview requested without an active .seqdiag preview context.");
        void vscode.window.showWarningMessage(
          "Open a .seqdiag file and toggle preview before reloading."
        );
        return;
      }
    })
  );
}
