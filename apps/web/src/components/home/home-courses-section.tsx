"use client";

import { MotionItem, MotionStagger } from "@workspace/motion";
import { ArrowUpRight, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HomeRecord } from "./home-types";
interface HomeCoursesSectionProps {
  courses: HomeRecord[];
  error?: string | null;
}

export function HomeCoursesSection({
  courses,
  error,
}: HomeCoursesSectionProps) {
  if (error) return null;

  return (
    <section className="relative py-32 overflow-hidden border-t border-border/40">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-primary" />
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.4em]">
                Academic_Repository
              </span>
            </div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-tighter leading-[0.9] flex flex-col">
              <span>核心课程集</span>
              <span className="text-muted-foreground/30">
                实战能力训练体系 /
              </span>
            </h2>
          </div>
          <Link
            href="/courses"
            className="group flex items-center gap-4 py-3 px-8 border border-foreground/10 hover:border-primary transition-all relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="text-xs font-bold uppercase tracking-widest relative z-10 group-hover:text-white transition-colors">
              查看全部课程
            </span>
            <ArrowUpRight className="w-4 h-4 relative z-10 group-hover:text-white transition-colors" />
          </Link>
        </div>

        <MotionStagger>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
            {courses.map((course, idx) => (
              <MotionItem key={course.id}>
                <Link
                  href={`/courses/${course.id}`}
                  className="group block relative border border-border/40 bg-muted/5 p-4 hover:border-primary transition-all duration-300"
                >
                  <div className="absolute inset-x-[-1px] inset-y-[-1px] border border-primary/0 group-hover:border-primary/40 pointer-events-none transition-all" />

                  {/* 资产容器 */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted mb-6">
                    <Image
                      src={course.cover}
                      alt={course.name}
                      fill
                      className="object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)] opacity-60 pointer-events-none" />

                    {/* 章节序号 */}
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-[9px] font-mono text-white border border-white/20 uppercase tracking-widest">
                        SEQ_ID: {idx.toString().padStart(3, "0")}
                      </span>
                    </div>

                    {/* 准入权限 */}
                    <div className="absolute bottom-4 right-4">
                      <span
                        className={`px-2 py-1 text-[9px] font-bold border ${course.isFree ? "bg-primary text-white border-primary" : "bg-black text-white border-white/20"}`}
                      >
                        {course.isFree
                          ? "限时免费"
                          : `专属内容 ¥${course.price}`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold tracking-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                        {course.name}
                      </h3>
                      <p className="text-[10px] font-mono text-muted-foreground/40 uppercase">
                        NODE_ENTRY_{course.id.padStart(4, "0")}
                      </p>
                    </div>

                    {/* 精准的业务指标 (中文化) */}
                    <div className="grid grid-cols-2 gap-y-3 pt-5 border-t border-border/20">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-primary" />
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {course.learnerNumber || 0} 人已加入
                        </span>
                      </div>
                      {/* <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] font-medium text-muted-foreground">
                          难度: 进阶级
                        </span>
                      </div> */}
                      {/* <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] font-medium text-muted-foreground">预计 40 课时</span>
                      </div> */}
                      {/* <div className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] font-medium text-muted-foreground">
                          实战环境可用
                        </span>
                      </div> */}
                    </div>
                  </div>
                </Link>
              </MotionItem>
            ))}
          </div>
        </MotionStagger>
      </div>
    </section>
  );
}
