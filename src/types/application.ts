/**
 * Single source of truth for application progression. The pipeline has
 * exactly five stages. `Rejected` is intentionally NOT one of them — it is
 * a side state stored on the application record (or on the employer
 * candidate record).
 */
export type ApplicationStage =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Hired";

export const APPLICATION_STAGES: ApplicationStage[] = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
];

/** Maps each stage to the next one in the pipeline, or `null` at the end. */
export const NEXT_STAGE: Record<ApplicationStage, ApplicationStage | null> = {
  Applied: "Screening",
  Screening: "Interview",
  Interview: "Offer",
  Offer: "Hired",
  Hired: null,
};

/** Position of each stage in the pipeline (0-based). */
export const STAGE_INDEX: Record<ApplicationStage, number> = {
  Applied: 0,
  Screening: 1,
  Interview: 2,
  Offer: 3,
  Hired: 4,
};

/** Human-readable label, currently identical to the stage name. */
export const STAGE_LABEL: Record<ApplicationStage, string> = {
  Applied: "Applied",
  Screening: "Screening",
  Interview: "Interview",
  Offer: "Offer",
  Hired: "Hired",
};

/**
 * shadcn `Badge` variant per stage. Goes from quiet (Applied) to
 * emphatic (Hired) so badges visually echo the pipeline position.
 */
export const STAGE_VARIANT: Record<
  ApplicationStage,
  "outline" | "secondary" | "default"
> = {
  Applied: "outline",
  Screening: "secondary",
  Interview: "secondary",
  Offer: "default",
  Hired: "default",
};
