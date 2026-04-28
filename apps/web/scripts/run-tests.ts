import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const testRoot = path.join(process.cwd(), "src");

const collectTestFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectTestFiles(entryPath);
      }

      return entry.isFile() && entry.name.endsWith(".test.ts")
        ? [entryPath]
        : [];
    })
  );

  return nested.flat();
};

const run = async () => {
  const testFiles = await collectTestFiles(testRoot);

  for (const testFile of testFiles) {
    await import(pathToFileURL(testFile).href);
  }
};

void run();
