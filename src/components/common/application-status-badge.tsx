import { Badge } from "@/components/ui/badge";
import { APPLICATION_STATUS_TONE } from "@/lib/status";

interface ApplicationStatusBadgeProps {
  status: keyof typeof APPLICATION_STATUS_TONE;
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const tone = APPLICATION_STATUS_TONE[status];
  const Icon = tone.icon;
  return (
    <Badge variant={tone.variant} className="gap-1">
      <Icon className="h-3 w-3" aria-hidden />
      {tone.label}
    </Badge>
  );
}
