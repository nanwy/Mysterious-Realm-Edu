import { SiteHeader } from "@workspace/ui";
import { HomeCoursesSection } from "./home-courses-section";
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fbff_24%,#ffffff_62%,#f8fbff_100%)] text-slate-900 dark:bg-[linear-gradient(180deg,#020617_0%,#081121_26%,#0f172a_62%,#020617_100%)] dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-8%] size-104 rounded-full bg-sky-200/45 blur-3xl dark:bg-sky-500/15" />
        <div className="absolute right-[-8%] top-[12%] size-104 rounded-full bg-cyan-100/60 blur-3xl dark:bg-cyan-400/10" />
        <div className="absolute bottom-[-10%] left-[20%] size-104 rounded-full bg-indigo-100/50 blur-3xl dark:bg-indigo-500/12" />
      </div>

      <SiteHeader />

      <main className="relative mx-auto flex max-w-360 flex-col gap-12 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <HomeHero
          banner={banners[0]}
          bannerError={bannerError}
          hotCourseCount={hotCourses.length}
          examCount={latestExams.length}
          newsCount={recommendedNews.length}
          questionnaireCount={questionnaires.length}
          announcementCount={announcements.length}
        />

        <section className="grid gap-10">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)]">
            <HomeCoursesSection courses={hotCourses} courseError={courseError} />
            <HomeSidebar
              announcements={announcements}
              announcementError={announcementError}
              examCount={latestExams.length}
            />
          </div>

          <HomeExamsSection exams={latestExams} examError={examError} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(280px,0.82fr)_minmax(340px,0.98fr)_minmax(300px,0.9fr)] xl:items-start">
          <HomeQuestionnairesSection
            questionnaires={questionnaires}
            questionnaireError={questionnaireError}
          />
          <HomeNewsSection
            recommendedNews={recommendedNews}
            recommendedNewsError={recommendedNewsError}
          />
          <HomeHotNewsSection hotNews={hotNews} hotNewsError={hotNewsError} />
        </section>
      </main>
    </div>
  );
}
