import type { Metadata } from "next";

import { DisputeTracker } from "@/components/features/candidate/dispute-tracker";
import {
  candidateDisputes,
  candidateCredentialNames,
} from "@/lib/candidate-helpers";

export const metadata: Metadata = {
  title: "My Disputes · CareerOS",
  description:
    "View and manage disputes you've filed against your university credentials.",
};

export default function CandidateDisputesPage() {
  return (
    <DisputeTracker
      initialDisputes={candidateDisputes}
      credentialNames={candidateCredentialNames}
    />
  );
}
