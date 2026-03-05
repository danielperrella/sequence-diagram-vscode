import * as fs from "node:fs/promises";
import * as path from "node:path";

export async function createArtifactDir(rootDir: string, suite: string): Promise<string> {
  const timestamp = new Date().toISOString().replaceAll(":", "-");
  const artifactDir = path.join(rootDir, timestamp, suite);
  await fs.mkdir(artifactDir, { recursive: true });
  return artifactDir;
}

export async function writeArtifact(
  artifactDir: string,
  filename: string,
  content: string
): Promise<string> {
  const target = path.join(artifactDir, filename);
  await fs.writeFile(target, content, "utf8");
  return target;
}

export async function trimArtifactHistory(rootDir: string, keep = 10): Promise<void> {
  try {
    const entries = await fs.readdir(rootDir, { withFileTypes: true });
    const directories = entries.filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));

    while (directories.length > keep) {
      const entry = directories.shift();

      if (!entry) {
        break;
      }

      await fs.rm(path.join(rootDir, entry.name), { recursive: true, force: true });
    }
  } catch {
    // Ignore missing artifact directories.
  }
}
