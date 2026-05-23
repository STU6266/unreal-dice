export interface ValidationIssue {
  path: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  issues: ValidationIssue[]
}

export function createValidationResult(
  issues: ValidationIssue[],
): ValidationResult {
  return {
    isValid: issues.length === 0,
    issues,
  }
}
