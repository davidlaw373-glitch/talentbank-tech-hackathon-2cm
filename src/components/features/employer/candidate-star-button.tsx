"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CandidateStarButtonProps = {
  candidateName: string;
  initialStarred?: boolean;
};

export function CandidateStarButton({
  candidateName,
  initialStarred = false,
}: CandidateStarButtonProps) {
  const [starred, setStarred] = useState(initialStarred);
  const { push } = useToast();

  const toggleStar = () => {
    setStarred((current) => !current);
    push({
      title: starred
        ? `Removed ${candidateName} from starred`
        : `Starred ${candidateName}`,
      description: starred
        ? "They won't appear in your starred list anymore."
        : "They'll surface at the top of your candidates list.",
      tone: "info",
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="bg-surface-1"
      aria-label={starred ? `Remove ${candidateName} from starred` : `Star ${candidateName}`}
      aria-pressed={starred}
      onClick={toggleStar}
    >
      <Star className={cn(starred && "fill-current")} aria-hidden />
    </Button>
  );
}
