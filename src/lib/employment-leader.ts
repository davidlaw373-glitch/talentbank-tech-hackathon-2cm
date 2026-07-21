export type IndustryCount = {
  label: string;
  count: number;
};

export type LeadingIndustrySummary = {
  value: string;
  detail: string;
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
