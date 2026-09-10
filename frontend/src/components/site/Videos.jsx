import { useState } from "react";
import { PlayCircle, Video as VideoIcon, Lock, Gift, ChevronDown } from "lucide-react";
import { Reveal, SectionTitle } from "./Reveal";

const ytId = (url = "") => {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
};

const FreeLesson = ({ video, index }) => {
  const id = ytId(video.url);
  return (
    <Reveal delay={index * 90}>
      <article
        data-testid={`free-video-${video.id}`}
        className="h-full flex flex-col rounded-3xl border-2 border-[#D4AF37]/60 bg-white overflow-hidden shadow-[0_20px_50px_-30px_rgba(10,31,68,0.5)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-30px_rgba(10,31,68,0.45)]"
      >
        <div className="relative aspect-video bg-[#0A1F44]">
          {id ? (
            <iframe
              title={video.title}
              data-testid={`free-video-frame-${video.id}`}
              src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : video.url ? (
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`free-video-link-${video.id}`}
              className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#1B3A6B] to-[#0A1F44] text-white"
            >
              <PlayCircle className="w-14 h-14 text-[#D4AF37]" />
            </a>
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#1B3A6B] to-[#0A1F44] text-white/70 text-sm text-center px-6">
              <span>
                <PlayCircle className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
                Snimak se postavlja uskoro
              </span>
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1">
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#D4AF37] text-[#0A1F44] px-3 py-1 text-[11px] font-bold tracking-wide">
            <Gift className="w-3 h-3" /> BESPLATNO
          </span>
          <h4 className="font-head text-base sm:text-lg font-semibold text-[#0A1F44] mt-3">{video.title}</h4>
          <p className="mt-2 text-sm text-[#475569] flex-1">{video.package}</p>
        </div>
      </article>
    </Reveal>
  );
};

export const Videos = ({ videos, onOrder }) => {
  const [expanded, setExpanded] = useState({});
  if (!videos?.length) return null;

  const free = videos.filter((v) => v.is_free).slice(0, 3);
  const paid = videos.filter((v) => !v.is_free);
  const groups = [...new Set(paid.map((v) => v.package || "Video lekcije"))];

  return (
    <section id="video" data-testid="videos-section" className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal>
          <SectionTitle
            eyebrow="Video lekcije"
            title="Uči kad tebi odgovara"
            subtitle="Svaka lekcija je snimljena korak po korak — zaustavi, vrati i ponovi koliko puta treba. Tri lekcije su potpuno besplatne i možeš ih pogledati odmah."
          />
        </Reveal>

        {free.length > 0 && (
          <div className="mt-10" data-testid="free-videos-block">
            <h3 className="font-head text-lg sm:text-xl font-semibold text-[#0A1F44] flex items-center gap-2.5">
              <Gift className="w-5 h-5 text-[#D4AF37]" /> Besplatne lekcije — gledaj odmah
            </h3>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {free.map((v, i) => (
                <FreeLesson key={v.id} video={v} index={i} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 space-y-12">
          {groups.map((g) => {
            const list = paid.filter((v) => (v.package || "Video lekcije") === g);
            const open = expanded[g];
            const shown = open ? list : list.slice(0, 6);
            return (
              <div key={g}>
                <h3 className="font-head text-lg sm:text-xl font-semibold text-[#1B3A6B] flex items-center gap-2.5">
                  <VideoIcon className="w-5 h-5 text-[#4A90D9]" /> {g}
                  <span className="text-xs font-normal text-[#94A3B8]">({list.length} lekcija)</span>
                </h3>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {shown.map((v, i) => {
                    const id = ytId(v.url);
                    return (
                      <Reveal key={v.id} delay={(i % 3) * 70}>
                        <article
                          data-testid={`video-card-${v.id}`}
                          className="group h-full flex flex-col rounded-3xl border border-[#E2E8F0] bg-white overflow-hidden shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5"
                        >
                          <div className="relative aspect-video bg-gradient-to-br from-[#1B3A6B] to-[#0A1F44] grid place-items-center overflow-hidden">
                            {id && (
                              <img
                                src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                                alt={v.title}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover opacity-45"
                              />
                            )}
                            <PlayCircle className="relative w-12 h-12 text-[#D4AF37] transition-transform duration-500 group-hover:scale-110" />
                          </div>
                          <div className="p-6 flex flex-col flex-1">
                            <h4 className="font-head text-base font-semibold text-[#0A1F44]">{v.title}</h4>
                            <p className="mt-2 text-sm text-[#475569] flex-1">
                              Lekcija je dostupna uz paket. Pošalji zahtev i dobijaš pristup svim snimcima.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3">
                              {v.url ? (
                                <a
                                  href={v.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  data-testid={`video-open-${v.id}`}
                                  className="inline-flex items-center gap-2 rounded-full bg-[#0A1F44] hover:bg-[#1B3A6B] text-white px-5 py-2.5 text-sm font-semibold transition-colors duration-300"
                                >
                                  <PlayCircle className="w-4 h-4" /> Pusti lekciju
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-2 rounded-full bg-[#F1F5F9] text-[#94A3B8] px-5 py-2.5 text-sm font-medium">
                                  <Lock className="w-4 h-4" /> Dostupno uz paket
                                </span>
                              )}
                              <button
                                onClick={() => onOrder({ group: g, name: v.title })}
                                data-testid={`video-order-${v.id}`}
                                className="inline-flex items-center rounded-full border border-[#E2E8F0] text-[#1B3A6B] px-5 py-2.5 text-sm font-medium hover:border-[#4A90D9] transition-colors duration-300"
                              >
                                Traži pristup
                              </button>
                            </div>
                          </div>
                        </article>
                      </Reveal>
                    );
                  })}
                </div>
                {list.length > 6 && (
                  <button
                    onClick={() => setExpanded({ ...expanded, [g]: !open })}
                    data-testid={`video-toggle-${g}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#D9E3F0] bg-white text-[#1B3A6B] px-6 py-2.5 text-sm font-medium hover:border-[#4A90D9] transition-colors duration-300"
                  >
                    {open ? "Prikaži manje" : `Prikaži sve lekcije (${list.length})`}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
