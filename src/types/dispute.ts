export type DisputeStatus = "Open" | "In review" | "Resolved" | "Rejected";

/**
 * A dispute raised against a specific `Credential`. The graduate identity
 * is derived from the credential, so name changes propagate automatically.
 */
export type Dispute = {
  id: number;
  credentialId: number;
  field: string;
  claim: string;
  counter: string;
  filedDate: string;
  status: DisputeStatus;
};
