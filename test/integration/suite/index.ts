import * as path from "node:path";
import Mocha from "mocha";

export function run(): Promise<void> {
  const mocha = new Mocha({
    ui: "tdd",
    color: true
  });
  const testsRoot = path.resolve(__dirname);

  return new Promise((resolve, reject) => {
    try {
      mocha.addFile(path.resolve(testsRoot, "extension.integration.test.js"));

      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error(`${failures} integration test(s) failed.`));
          return;
        }

        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
