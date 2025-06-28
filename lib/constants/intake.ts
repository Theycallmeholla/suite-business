/**
 * Intake System Constants
 * 
 * **Created**: June 28, 2025, 4:15 PM CST
 * **Last Updated**: June 28, 2025, 4:15 PM CST
 * 
 * Constants for the smart intake question system.
 */

/**
 * Threshold for expected service prevalence
 * Services with prevalence >= this threshold are considered "expected"
 * and will be pre-selected in the service selection UI
 * 
 * Can be overridden via INTAKE_EXPECTED_THRESHOLD environment variable
 */
export const EXPECTED_PREVALENCE_THRESHOLD = 
  process.env.INTAKE_EXPECTED_THRESHOLD ? 
  parseFloat(process.env.INTAKE_EXPECTED_THRESHOLD) : 
  0.7;

/**
 * Maximum number of missing expected services to store
 * Prevents dataScore JSON from growing too large
 */
export const MAX_MISSING_EXPECTED_SERVICES = 20;

/**
 * Maximum number of questions to generate
 * Even with smart filtering, we cap at 5 for better UX
 */
export const MAX_SMART_QUESTIONS = 5;