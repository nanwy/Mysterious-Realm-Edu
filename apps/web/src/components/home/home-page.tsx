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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1440px] px-4 md:px-8 lg:px-12 pb-24">
        {/* 首屏核心区域 */}
        <HomeHero
          banner={banners[0]}
          bannerError={bannerError}
          hotCourseCount={hotCourses.length}
          examCount={latestExams.length}
          newsCount={recommendedNews.length}
          questionnaireCount={questionnaires.length}
          announcementCount={announcements.length}
        />

        {/* 动态信息流排版区：采用基于边界的新一代网格系统 */}
        <section className="grid gap-12 pt-16 lg:pt-24 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <div className="flex flex-col gap-16 lg:gap-24 lg:border-r lg:border-border/40 lg:pr-16">
            <HomeCoursesSection
              courses={hotCourses}
              courseError={courseError}
              announcements={announcements}
              announcementError={announcementError}
              examCount={latestExams.length}
            />

            <HomeExamsSection exams={latestExams} examError={examError} />
            
            <HomeNewsSection
              recommendedNews={recommendedNews}
              recommendedNewsError={recommendedNewsError}
            />
          </div>

          {/* 窄列信息流 / 辅助队列 */}
          <aside className="flex flex-col gap-12 border-t border-border/40 pt-12 lg:border-none lg:pt-0 lg:sticky lg:top-24 lg:self-start">
            <HomeQuestionnairesSection
              questionnaires={questionnaires}
              questionnaireError={questionnaireError}
            />
            <HomeHotNewsSection hotNews={hotNews} hotNewsError={hotNewsError} />
          </aside>
        </section>

        {/* 底部召唤区 */}
        <div className="pt-24 border-t border-border/40 mt-24">
          <HomeCtaSection />
        </div>
      </main>
    </div>
  );
}
