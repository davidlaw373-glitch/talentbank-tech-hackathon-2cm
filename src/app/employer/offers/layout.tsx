import type { ReactNode } from "react";

import { OfferWorkflowProvider } from "@/components/features/employer/offers/offer-workflow-provider";

export default function EmployerOffersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <OfferWorkflowProvider>{children}</OfferWorkflowProvider>;
}
