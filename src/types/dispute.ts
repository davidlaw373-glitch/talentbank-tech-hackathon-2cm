export type DisputeStatus = "Open" | "In review" | "Resolved" | "Rejected";

export type DisputeAuthorRole = "candidate" | "faculty";

/**
 * A single turn in a dispute thread. Threads read like a messaging
 * conversation: the candidate files a claim, faculty counters, the
 * candidate can reply, and so on. Once a later message exists, an earlier
 * message is historical and must not be edited — only the newest message
 * from its own author may still be edited in place, which is what `edited`
 * reflects to the reader.
 */
export type DisputeMessage = {
  id: string;
  author: DisputeAuthorRole;
  body: string;
  postedDate: string;
  edited?: boolean;
};

/**
 * A dispute raised against a specific `Credential`. The graduate identity
 * is derived from the credential, so name changes propagate automatically.
 */
export type Dispute = {
  id: number;
  credentialId: number;
  field: string;
  filedDate: string;
  status: DisputeStatus;
  messages: DisputeMessage[];
};
