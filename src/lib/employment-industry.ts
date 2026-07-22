export type IndustryCount = {
  label: string;
  count: number;
};

export type LeadingIndustrySummary = {
  value: string;
  detail: string;
};

export type IndustryInsight = {
  visibleDistribution: IndustryCount[];
  leadingIndustry: LeadingIndustrySummary;
};

function joinIndustryNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

export function getLeadingIndustrySummary(
  industries: IndustryCount[]
): LeadingIndustrySummary {
  const highestCount = Math.max(...industries.map((industry) => industry.count), 0);

  if (highestCount === 0) {
    return {
      value: "No industry recorded",
      detail: "No confirmed employed outcomes include an industry",
    };
  }

  const leaders = industries
    .filter((industry) => industry.count === highestCount)
    .map((industry) => industry.label)
    .sort((left, right) => left.localeCompare(right));

  if (leaders.length === 1) {
    return {
      value: leaders[0],
      detail: `${highestCount} confirmed employed graduate${highestCount === 1 ? "" : "s"}`,
    };
  }

  return {
    value: `${leaders.length} industries tied`,
    detail: `${joinIndustryNames(leaders)} — ${highestCount} graduate${highestCount === 1 ? "" : "s"} each`,
  };
}

function countIndustries(values: Array<string | undefined>): IndustryCount[] {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    if (value?.trim()) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

export function getIndustryInsight(
  values: Array<string | undefined>
): IndustryInsight {
  const fullDistribution = countIndustries(values);

  return {
    visibleDistribution: fullDistribution.slice(0, 5),
    leadingIndustry: getLeadingIndustrySummary(fullDistribution),
  };
}
