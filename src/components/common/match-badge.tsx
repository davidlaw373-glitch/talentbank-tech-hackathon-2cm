import { Badge } from "@/components/ui/badge";
import { matchTone } from "@/lib/status";
import { cn } from "@/lib/utils";

interface MatchBadgeProps {
  score: number;
  showScore?: boolean;
  className?: string;
}

export function MatchBadge({ score, showScore = true, className }: MatchBadgeProps) {
  const tone = matchTone(score);
  return (
    <Badge variant={tone.variant} className={cn(className)}>
      {showScore && `${score}% · `}
      {tone.label}
    </Badge>
  );
}
