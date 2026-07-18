import { ScrollProgress } from "@/components/common/scroll-progress";
import { SkipLink } from "@/components/common/skip-link";
import { CoverCta } from "@/components/features/cover/cover-cta";
import { CoverFeatures } from "@/components/features/cover/cover-features";
import { CoverFooter } from "@/components/features/cover/cover-footer";
import { CoverHero } from "@/components/features/cover/cover-hero";
import { CoverHow } from "@/components/features/cover/cover-how";
import { CoverManifesto } from "@/components/features/cover/cover-manifesto";
import { CoverNav } from "@/components/features/cover/cover-nav";
import { CoverPathFinder } from "@/components/features/cover/cover-path-finder";
import { CoverPlatform } from "@/components/features/cover/cover-platform";
import { CoverRoles } from "@/components/features/cover/cover-roles";

export default function Home() {
  return (
    <>
      <SkipLink />
      <ScrollProgress />
      <CoverNav />
      <main id="main-content" tabIndex={-1}>
        <CoverHero />
        <CoverManifesto />
        <CoverRoles />
        <CoverPlatform />
        <CoverHow />
        <CoverPathFinder />
        <CoverFeatures />
        <CoverCta />
      </main>
      <CoverFooter />
    </>
  );
}
