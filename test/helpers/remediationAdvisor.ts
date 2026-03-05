import { FailureDiagnosis } from "../types";
import { diagnoseFailure } from "./failureClassifier";

export function getRemediationAdvice(category: FailureDiagnosis["category"]): FailureDiagnosis {
  return diagnoseFailure(category);
}
