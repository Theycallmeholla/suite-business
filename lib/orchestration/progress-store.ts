/**
 * Progress Store Utilities
 * 
 * **Created**: December 15, 2024, 5:00 PM CST
 * **Last Updated**: December 15, 2024, 5:00 PM CST
 * 
 * Manages real-time progress tracking for website generation
 */

// In-memory progress tracking (in production, use Redis)
const progressStore = new Map<string, any>();

/**
 * Update progress for a generation
 */
export function updateGenerationProgress(generationId: string, progress: any) {
  progressStore.set(generationId, {
    ...progress,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get current progress
 */
export function getGenerationProgress(generationId: string) {
  return progressStore.get(generationId);
}

/**
 * Delete progress data
 */
export function deleteGenerationProgress(generationId: string) {
  progressStore.delete(generationId);
}

/**
 * Clear all progress data
 */
export function clearAllProgress() {
  progressStore.clear();
}

/**
 * Get all active generations
 */
export function getAllActiveGenerations(): string[] {
  return Array.from(progressStore.keys());
}

/**
 * Check if generation exists
 */
export function hasGeneration(generationId: string): boolean {
  return progressStore.has(generationId);
}