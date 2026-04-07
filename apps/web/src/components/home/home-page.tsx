import { SiteHeader } from "@workspace/ui";
import { HomeCoursesSection } from "./home-courses-section";
import { HomeCtaSection } from "./home-cta-section";
import { HomeExamsSection } from "./home-exams-section";
import { HomeHero } from "./home-hero";
import { HomeHotNewsSection } from "./home-hot-news-section";
import { HomeNewsSection } from "./home-news-section";
import { HomeQuestionnairesSection } from "./home-questionnaires-section";
import type { HomePayload } from "./home-types";

export function HomePage({
  banners,
  announcements,
  hotCourses,
  latestExams,
  questionnaires,
  recommendedNews,
  hotNews,
  bannerError,
  announcementError,
  courseError,
  examError,
  questionnaireError,
  recommendedNewsError,
  hotNewsError,
}: HomePayload) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(79,70,255,0.08),transparent_24%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_22%),linear-gradient(180deg,#f4f6fb_0%,#f7f9fc_34%,#fbfcfe_100%)] text-foreground dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(79,70,255,0.16),transparent_22%),linear-gradient(180deg,#020617_0%,#081121_26%,#0f172a_62%,#020617_100%)]">
      <SiteHeader />

      <main className="relative mx-auto flex max-w-[1400px] flex-col gap-16 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <HomeHero
          banner={banners[0]}
          bannerError={bannerError}
          hotCourseCount={hotCourses.length}
          examCount={latestExams.length}
          newsCount={recommendedNews.length}
          questionnaireCount={questionnaires.length}
          announcementCount={announcements.length}
        />

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1.22fr)_340px] xl:items-start">
          <div className="grid gap-10">
            <HomeCoursesSection
              courses={hotCourses}
              courseError={courseError}
              announcements={announcements}
              announcementError={announcementError}
              examCount={latestExams.length}
            />

            <HomeExamsSection exams={latestExams} examError={examError} />
          </div>

          <aside className="grid gap-8 xl:sticky xl:top-24">
            <HomeHotNewsSection hotNews={hotNews} hotNewsError={hotNewsError} />
            <HomeQuestionnairesSection
              questionnaires={questionnaires}
              questionnaireError={questionnaireError}
            />
          </aside>
        </section>

        <HomeNewsSection
          recommendedNews={recommendedNews}
          recommendedNewsError={recommendedNewsError}
        />

        <HomeCtaSection />
      </main>
    </div>
  );
}
