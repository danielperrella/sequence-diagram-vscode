import * as http from "node:http";
import { AddressInfo } from "node:net";

export type FakeRendererMode =
  | "healthy"
  | "missing_api"
  | "invalid_data_url"
  | "timeout"
  | "http_500";

export interface FakeRendererScenario {
  name: string;
  runtimeMode: FakeRendererMode;
}

export interface FakeRendererHandle {
  baseUrl: string;
  close(): Promise<void>;
}

export async function startFakeRendererServer(
  scenario: FakeRendererScenario = { name: "healthy", runtimeMode: "healthy" }
): Promise<FakeRendererHandle> {
  const server = http.createServer((_, response) => {
    if (scenario.runtimeMode === "http_500") {
      response.statusCode = 500;
      response.end("Renderer error");
      return;
    }

    response.setHeader("content-type", "text/html; charset=utf-8");
    response.end(getRuntimeHtml(scenario.runtimeMode));
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as AddressInfo;

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }
  };
}

function getRuntimeHtml(mode: FakeRendererMode): string {
  switch (mode) {
    case "missing_api":
      return "<!DOCTYPE html><html><body><script>window.SEQ = {};</script></body></html>";
    case "invalid_data_url":
      return runtimeWithCallback("not-a-data-url");
    case "timeout":
      return "<!DOCTYPE html><html><body><script>window.SEQ={api:{generateSvgDataUrl(){},generatePngDataUrl(){}}};</script></body></html>";
    default:
      return runtimeWithCallback("data:image/svg+xml;base64,PHN2Zy8+");
  }
}

function runtimeWithCallback(payload: string): string {
  return `<!DOCTYPE html>
<html>
  <body>
    <script>
      window.SEQ = {
        api: {
          generateSvgDataUrl: function(_source, callback) {
            callback("${payload}");
          },
          generatePngDataUrl: function(_source, callback) {
            callback("data:image/png;base64,UE5H");
          }
        }
      };
    </script>
  </body>
</html>`;
}
