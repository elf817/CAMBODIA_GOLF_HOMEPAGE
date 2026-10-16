"use client";

import { useEffect, useState } from "react";
import FacilityShell from "@/components/FacilityShell";
import RevealBelowTabs from "@/components/RevealBelowTabs";
import { useLanguage } from "@/components/LanguageContext";
import { listVideos, type Video } from "@/lib/api";

export default function VideoPage() {
  const { lang } = useLanguage();
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listVideos()
      .then(setVideos)
      .catch((err) => setError(err instanceof Error ? err.message : (lang === "en" ? "Failed to load." : "불러오지 못했습니다.")));
  }, [lang]);

  return (
    <FacilityShell
      summary={
        videos
          ? lang === "en"
            ? `${videos.length} Videos`
            : `영상 ${videos.length}개`
          : ""
      }
    >
      <section className="px-5 sm:px-36 pt-10 sm:pt-[76px] pb-16 sm:pb-[104px]">
        <RevealBelowTabs className="mb-10 sm:mb-14 flex flex-col items-center text-center">
          <p className="mb-4 text-[11px] tracking-[0.34em] text-bronze">VIDEO</p>
          <h2 className="mb-5 font-kr-heading font-normal text-[28px] sm:text-[36px] text-deep">
            {lang === "en" ? "Promotional Videos" : "홍보영상"}
          </h2>
          <div className="mb-6 w-10 h-[2px] bg-gold" />
          <p className="text-[16px] sm:text-[17px] text-deep font-medium">
            {lang === "en"
              ? "Watch Siem Reap Booyoung C.C. in motion."
              : "영상으로 만나는 씨엠립 부영 컨트리클럽."}
          </p>
        </RevealBelowTabs>

        {error && <p className="text-center text-[14px] text-muted-2">{error}</p>}
        {!error && !videos && (
          <p className="text-center text-[14px] text-muted-2">{lang === "en" ? "Loading…" : "불러오는 중…"}</p>
        )}
        {videos && videos.length === 0 && (
          <p className="text-center text-[14px] text-muted-2">
            {lang === "en" ? "No videos yet." : "등록된 영상이 없습니다."}
          </p>
        )}

        {videos && videos.length > 0 && (
          <div className="max-w-[1037px] mx-auto grid grid-cols-1 gap-10 sm:gap-14">
            {videos.map((video) => (
              <div key={video.id}>
                <div className="relative aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="mt-4 text-[15px] text-deep font-medium text-center">{video.title}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </FacilityShell>
  );
}
