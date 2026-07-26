import type { Employer } from "@/types/employer";
import type { Job } from "@/types/job";
import styles from "./job-posting-preview-report.module.css";

export function JobPostingPreviewReport({
  job,
  employer,
}: {
  job: Job;
  employer?: Employer;
}) {
  const companyName = employer?.companyName ?? "Company";

  return (
    <article className="mx-auto max-w-6xl border bg-surface-1 px-8 py-12 text-foreground shadow-sm sm:px-12 sm:py-14 lg:px-16 lg:py-16">
      <header className={styles.reportHeader}>
        <p className="text-meta font-semibold uppercase tracking-[0.14em]">
          {companyName}
        </p>
        <h1 className="mt-4 text-display">{job.title}</h1>
      </header>

      <div className={styles.reportFlow}>
        <DocumentSection title="Description">
          <p className="max-w-3xl text-body leading-7 text-foreground">
            {job.description}
          </p>
        </DocumentSection>

        <DocumentSection title="Job details">
          <div className="space-y-3 text-body text-foreground">
            <InlineDetail label="Employment type" value={job.employmentType} />
            <InlineDetail label="Work arrangement" value={job.workMode} />
            <InlineDetail label="Location" value={job.location} />
            <InlineDetail label="Department" value={job.department} />
            <InlineDetail label="Compensation" value={job.salary} />
          </div>
        </DocumentSection>

        <DocumentSection title="Responsibilities">
          <FormalList items={job.responsibilities} />
        </DocumentSection>

        <DocumentSection title="Requirements and qualifications">
          <FormalList items={job.requirements} />
        </DocumentSection>

        <DocumentSection title="Skills">
          <div className="grid gap-8 sm:grid-cols-2">
            <SkillList title="Required skills" items={job.mustHave} />
            <SkillList title="Preferred skills" items={job.niceToHave} />
          </div>
        </DocumentSection>

        <DocumentSection title={`About ${companyName}`}>
          <div className="space-y-4 text-body leading-7 text-foreground">
            <p>{employer?.about ?? job.aboutCompany}</p>
            {employer ? (
              <p>
                Founded in {employer.founded}, {companyName} operates in the{" "}
                {employer.industry} sector and is headquartered in {employer.hq}.
              </p>
            ) : null}
          </div>
        </DocumentSection>

        {employer?.benefits.length ? (
          <DocumentSection title="Benefits">
            <FormalList items={employer.benefits} />
          </DocumentSection>
        ) : null}

        <section aria-label="Company and application contact">
          <div className="mt-4 grid gap-6 border-t pt-6 text-meta text-foreground sm:grid-cols-2 sm:gap-x-12">
            <dl className="space-y-3">
              <ContactDetail label="Company" value={companyName} />
              <ContactDetail
                label="Website"
                value={employer?.website ?? "Not provided"}
                href={
                  employer?.website
                    ? `https://${employer.website}`
                    : undefined
                }
              />
            </dl>
            <dl className="space-y-3">
              <ContactDetail
                label="Recruitment email"
                value={employer?.contactEmail ?? "Not provided"}
                href={
                  employer?.contactEmail
                    ? `mailto:${employer.contactEmail}`
                    : undefined
                }
              />
              <ContactDetail
                label="Telephone"
                value={employer?.contactPhone ?? "Not provided"}
                href={
                  employer?.contactPhone
                    ? `tel:${employer.contactPhone.replace(/\s/g, "")}`
                    : undefined
                }
              />
            </dl>
          </div>
          <p className="mt-6 text-meta leading-6 text-foreground">
            For questions about this position or reasonable adjustments during
            the recruitment process, contact the company using the details above.
          </p>
        </section>
      </div>
    </article>
  );
}

function DocumentSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div style={{ marginTop: "0.75rem" }}>{children}</div>
    </section>
  );
}

function SectionTitle({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} className="text-heading">
      {children}
    </h2>
  );
}

function FormalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-body leading-7 text-foreground">
      {items.map((item) => (
        <li
          key={item}
          style={{
            display: "grid",
            gridTemplateColumns: "0.5rem minmax(0, 1fr)",
            alignItems: "start",
            columnGap: "0.75rem",
          }}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-foreground"
            style={{ marginTop: "0.7rem" }}
          />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SkillList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-subheading">{title}</h3>
      <ul className="mt-2 space-y-2 text-body text-foreground">
        {items.map((item) => (
          <li
            key={item}
            style={{
              display: "grid",
              gridTemplateColumns: "0.5rem minmax(0, 1fr)",
              alignItems: "start",
              columnGap: "0.75rem",
            }}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-foreground"
              style={{ marginTop: "0.45rem" }}
            />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InlineDetail({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-semibold text-foreground">{label}:</span> {value}
    </p>
  );
}

function ContactDetail({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex flex-wrap gap-x-1">
      <dt className="font-semibold text-foreground">{label}:</dt>
      <dd>
        {href ? (
          <a
            href={href}
            className="underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
