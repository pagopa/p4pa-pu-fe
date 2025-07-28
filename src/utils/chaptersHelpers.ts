/**
 * Utility functions for the management and transformation of chapters (assessment registries)
 * Pure functions to improve testability and reusability
 */

export type AssessmentRegistryItem = {
  assessmentRegistryId?: number;
  organizationId?: number;
  sectionCode?: string;
  sectionDescription?: string;
  officeDescription?: string;
  assessmentCode?: string;
  assessmentDescription?: string;
  operatingYear?: string;
  status?: string;
  creationDate?: string;
};

export type ChapterOption = {
  label: string;
  value: string;
  assessmentRegistryId?: number;
};

/**
 * Builds the parts of the label for a chapter
 * @param chapter - Assessment registry item
 * @returns Array of strings to build the label
 */
const buildLabelParts = (chapter: AssessmentRegistryItem): Array<string> => {
  const parts: Array<string> = [];

  if (chapter.officeDescription) {
    parts.push(chapter.officeDescription);
  }

  const sectionDesc = chapter.sectionDescription || chapter.sectionCode;
  if (sectionDesc) {
    parts.push(sectionDesc);
  }

  if (chapter.assessmentDescription) {
    parts.push(chapter.assessmentDescription);
  }

  return parts;
};

/**
 * Transforms a single assessment registry item into a chapter option
 * @param chapter - Assessment registry item to transform
 * @returns Transformed ChapterOption
 */
export const transformChapterItem = (
  chapter: AssessmentRegistryItem
): ChapterOption => {
  const parts = buildLabelParts(chapter);
  const label =
    parts.length > 0 ? parts.join(' - ') : chapter.sectionCode || '-';

  return {
    label,
    value: chapter.sectionCode || '',
    assessmentRegistryId: chapter.assessmentRegistryId
  };
};

/**
 * Transforms an array of assessment registry items into chapter options
 * Applies filters, sorting and transformation as in the original logic
 * @param data - Array of assessment registry items
 * @returns Array of transformed and sorted ChapterOptions
 */
export const transformChaptersData = (
  data: Array<AssessmentRegistryItem>
): Array<ChapterOption> => {
  return data
    .filter((chapter) => chapter && chapter.sectionCode)
    .sort((a, b) => (a.sectionCode || '').localeCompare(b.sectionCode || ''))
    .map(transformChapterItem);
};

/**
 * Creates a getter function to get the assessmentRegistryId from a chapter code
 * @param chapters - Array of chapter options
 * @returns Function that returns the assessmentRegistryId for a given chapterCode
 */
export const createAssessmentRegistryIdGetter =
  (chapters: Array<ChapterOption>) =>
  (chapterCode: string): number | undefined => {
    return chapters.find((chapter) => chapter.value === chapterCode)
      ?.assessmentRegistryId;
  };
