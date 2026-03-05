import { FailureCategory } from "../types";

export function shouldRetry(category: FailureCategory): boolean {
  return category === "ui_selector_failure" || category === "flaky_timeout";
}
