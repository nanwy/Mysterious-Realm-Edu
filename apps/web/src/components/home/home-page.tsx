import { SiteHeader } from "@workspace/ui";
import { HomeCoursesSection } from "./home-courses-section";
import { HomeCtaSection } from "./home-cta-section";
import { HomeExamsSection } from "./home-exams-section";
import { HomeHero } from "./home-hero";
import { HomeHotNewsSection } from "./home-hot-news-section";
import { HomeNewsSection } from "./home-news-section";
import { HomeQuestionnairesSection } from "./home-questionnaires-section";
import { HomeSidebar } from "./home-sidebar";
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
    <div className="min-h-screen bg-background text-foreground dark:bg-[linear-gradient(180deg,#020617_0%,#081121_26%,#0f172a_62%,#020617_100%)]">
      <SiteHeader />

      <main className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <HomeHero
          banner={banners[0]}
          bannerError={bannerError}
          hotCourseCount={hotCourses.length}
          examCount={latestExams.length}
          newsCount={recommendedNews.length}
          questionnaireCount={questionnaires.length}
          announcementCount={announcements.length}
        />

        <HomeCoursesSection
          courses={hotCourses}
          courseError={courseError}
          announcements={announcements}
          announcementError={announcementError}
          examCount={latestExams.length}
        />

        <HomeExamsSection exams={latestExams} examError={examError} />

        <section className="grid gap-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] xl:items-start">
            <HomeNewsSection
              recommendedNews={recommendedNews}
              recommendedNewsError={recommendedNewsError}
            />
            <HomeHotNewsSection hotNews={hotNews} hotNewsError={hotNewsError} />
          </div>

          <HomeQuestionnairesSection
            questionnaires={questionnaires}
            questionnaireError={questionnaireError}
          />
        </section>

        <HomeCtaSection />
      </main>
    </div>
  );
}
