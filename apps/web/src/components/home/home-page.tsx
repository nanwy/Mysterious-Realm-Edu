import { SiteHeader } from "@workspace/ui";
import { HomeCoursesSection } from "./home-courses-section";
import { HomeCtaSection } from "./home-cta-section";
import { HomeExamsSection } from "./home-exams-section";
import { HomeHero } from "./home-hero";
import { HomeSidebar } from "./home-sidebar";
import { HomeNewsSection } from "./home-news-section";
import { HomeHotNewsSection } from "./home-hot-news-section";
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
    <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#0A0A0A] bg-[url('/noise.png')] bg-repeat selection:bg-foreground/10 text-foreground">
      <SiteHeader />

      <main className="relative mx-auto max-w-[1536px] px-4 py-8 lg:px-8 xl:px-12 xl:py-12">
        {/* 精密拼图架构：所有主要内容全部收入一个统一无缝共享边框的大长方形中 */}
        <div className="flex flex-col border border-border/50 shadow-[0_4px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)] bg-background">
          <HomeHero
            banner={banners[0]}
            bannerError={bannerError}
            hotCourseCount={hotCourses.length}
            examCount={latestExams.length}
            newsCount={recommendedNews.length}
            questionnaireCount={questionnaires.length}
            announcementCount={announcements.length}
          />

          <div className="grid xl:grid-cols-[1fr_360px] divide-y xl:divide-y-0 xl:divide-x divide-border/50 border-t border-border/50">
            {/* 左半侧主屏内容流 */}
            <div className="flex flex-col divide-y divide-border/50">
              <HomeCoursesSection
                courses={hotCourses}
                courseError={courseError}
              />

              <HomeExamsSection exams={latestExams} examError={examError} />

              {/* 此处可放置推荐新闻流，采用相同结构并入 */}
              <div className="p-6 lg:px-12 lg:py-10 bg-muted/5 hover:bg-muted/10 transition-colors">
                <HomeNewsSection
                  recommendedNews={recommendedNews}
                  recommendedNewsError={recommendedNewsError}
                />
              </div>
            </div>

            {/* 右半侧常驻控制台侧栏 */}
            <aside className="flex flex-col divide-y divide-border/50 bg-background/50">
              <HomeSidebar
                announcements={announcements}
                announcementError={announcementError}
                examCount={latestExams.length}
              />
              <HomeQuestionnairesSection
                questionnaires={questionnaires}
                questionnaireError={questionnaireError}
              />
              <HomeHotNewsSection
                hotNews={hotNews}
                hotNewsError={hotNewsError}
              />
            </aside>
          </div>
        </div>

        <div className="mt-12">
          <HomeCtaSection />
        </div>
      </main>
    </div>
  );
}
