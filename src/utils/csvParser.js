import Papa from 'papaparse';
import { z } from 'zod';

/**
 * Zod schema for validating flashcard CSV rows
 */
const FlashcardRowSchema = z.object({
  polish: z.string().min(1, 'Polish translation is required').trim(),
  english: z.string().min(1, 'English translation is required').trim(),
  level_id: z.string().min(1, 'Level is required').trim(),
  category_slug: z.string().optional().default(''),
  mode: z
    .string()
    .optional()
    .default('vocabulary')
    .refine((val) => ['vocabulary', 'sentences'].includes(val), {
      message: 'Mode must be either "vocabulary" or "sentences"'
    })
});

/**
 * Parse CSV file and return validated flashcard objects
 * @param {File} file - CSV file to parse
 * @returns {Promise<{data: Array, errors: Array}>}
 */
export async function parseFlashcardsCSV(file) {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        const validated = [];
        const errors = [];

        results.data.forEach((row, index) => {
          try {
            // Skip completely empty rows
            if (Object.values(row).every((val) => !val)) {
              return;
            }

            const validatedRow = FlashcardRowSchema.parse(row);
            validated.push({
              ...validatedRow,
              _rowIndex: index + 2 // +2 because index 0 is header, +1 for display
            });
          } catch (err) {
            if (err instanceof z.ZodError) {
              errors.push({
                row: index + 2,
                message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')
              });
            }
          }
        });

        resolve({
          data: validated,
          errors,
          totalRows: results.data.length
        });
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [
            {
              row: 'file',
              message: `CSV parsing error: ${error.message}`
            }
          ],
          totalRows: 0
        });
      }
    });
  });
}

/**
 * Export flashcards to CSV file
 * @param {Array} flashcards - Array of flashcard objects
 * @param {string} filename - Optional filename
 */
export function exportFlashcardsToCSV(flashcards, filename = 'flashcards.csv') {
  if (!flashcards || flashcards.length === 0) {
    throw new Error('No flashcards to export');
  }

  // Define CSV headers
  const headers = ['polish', 'english', 'level_id', 'category_slug', 'mode'];

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...flashcards.map((card) =>
      headers
        .map((header) => {
          const value = card[header] || '';
          // Escape quotes and wrap in quotes if contains comma or newline
          const escaped = String(value).replace(/"/g, '""');
          return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')
            ? `"${escaped}"`
            : escaped;
        })
        .join(',')
    )
  ].join('\n');

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate CSV template for users
 * @returns {string} CSV template content
 */
export function getFlashcardCSVTemplate() {
  return `polish,english,level_id,category_slug,mode
słowo,word,A1,,vocabulary
zdanie,sentence,A1,,sentences
dom,house,A1,family,vocabulary`;
}

/**
 * Download CSV template
 */
export function downloadFlashcardTemplate() {
  const template = getFlashcardCSVTemplate();
  const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'flashcards-template.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
