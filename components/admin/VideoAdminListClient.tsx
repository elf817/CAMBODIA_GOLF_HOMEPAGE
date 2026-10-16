"use client";

import { FormEvent, useEffect, useState } from "react";
import { createVideo, deleteVideo, extractYoutubeId, listVideos, type Video } from "@/lib/api";

const inputClass =
  "w-full px-4 py-3 bg-bg border border-deep/20 text-[14px] text-ink focus:outline-none focus:border-deep transition-colors";

export default function VideoAdminListClient() {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    listVideos()
      .then(setVideos)
      .catch((err) => setError(err instanceof Error ? err.message : "불러오지 못했습니다."));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const youtubeId = extractYoutubeId(url);
    if (!title.trim() || !youtubeId) {
      setFormError("제목과 유효한 유튜브 링크를 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await createVideo({ title: title.trim(), youtubeId });
      setTitle("");
      setUrl("");
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("이 영상을 삭제할까요?")) return;
    try {
      await deleteVideo(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  return (
    <div>
      <h1 className="mb-6 font-kr-heading text-[22px] text-deep">홍보영상 관리</h1>

      <form onSubmit={handleSubmit} className="mb-10 flex flex-col gap-4 max-w-[560px]">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="영상 제목"
          className={inputClass}
        />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="유튜브 링크 (예: https://www.youtube.com/watch?v=xxxxxxxxxxx)"
          className={inputClass}
        />
        {formError && <p className="text-[13px] text-[#b23b3b]">{formError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="self-start px-6 py-3 bg-deep text-bg text-[13.5px] tracking-[0.06em] hover:bg-deep-dark transition-colors disabled:opacity-50"
        >
          {submitting ? "등록 중…" : "영상 등록"}
        </button>
      </form>

      {error && <p className="text-[14px] text-muted-2">{error}</p>}
      {!error && !videos && <p className="text-[14px] text-muted-2">불러오는 중…</p>}
      {videos && videos.length === 0 && <p className="text-[14px] text-muted-2">등록된 영상이 없습니다.</p>}

      {videos && videos.length > 0 && (
        <div className="border-t border-deep/20">
          {videos.map((v) => (
            <div key={v.id} className="flex items-center gap-4 px-2 py-4 border-b border-deep/[0.12]">
              <span className="flex-1 text-[14px] text-ink overflow-hidden text-ellipsis whitespace-nowrap">
                {v.title}
              </span>
              <a
                href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-ink-soft border-b border-muted-3 shrink-0"
              >
                미리보기
              </a>
              <span className="text-[12.5px] text-muted-2 w-[90px] shrink-0">{v.createdAt}</span>
              <button onClick={() => handleDelete(v.id)} className="text-[13px] text-[#b23b3b] border-b border-[#b23b3b]/40 shrink-0">
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
