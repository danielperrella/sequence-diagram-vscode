import * as vscode from "vscode";
import { registerExportCommands } from "./export/exportCommands";
import { registerSeqdiagLanguageFeatures } from "./language";
import { appLogger } from "./logging/logger";
import { SequenceDiagramPreviewController } from "./preview/SequenceDiagramPreviewController";

export function activate(context: vscode.ExtensionContext): void {
  appLogger.initialize(context);
  const logger = appLogger.child("Extension");
  logger.info("Activating extension.");

  const previewController = new SequenceDiagramPreviewController(context);

  const togglePreviewCommand = vscode.commands.registerCommand(
    "sequencediagram.togglePreview",
    async () => {
      logger.info("Toggle preview command invoked.");
      await previewController.togglePreview();
    }
  );

  context.subscriptions.push(
    previewController,
    togglePreviewCommand,
    registerExportCommands(previewController),
    registerSeqdiagLanguageFeatures(context)
  );

  logger.info("Extension activation complete.");
}

export function deactivate(): void {
  appLogger.child("Extension").info("Extension deactivated.");
}
