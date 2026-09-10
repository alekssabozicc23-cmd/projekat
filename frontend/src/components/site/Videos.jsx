import { PlayCircle, Video as VideoIcon, Lock } from "lucide-react";
import { Reveal, SectionTitle } from "./Reveal";

const ytId = (url = "") => {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
};

export const Videos = ({ videos, onOrder }) => {
  if (!videos?.length) return null;
  const groups = [...new Set(videos.map((v) => v.package || "Video lekcije"))];

  return (
    <section id="video" data-testid="videos-section" className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal>
          <SectionTitle
            eyebrow="Video lekcije"
            title="Uči kad tebi odgovara"
            subtitle="Svaka lekcija je snimljena korak po korak — zaustavi, vrati i ponovi koliko puta treba. Lekcije su deo paketa, a ovde možeš videti šta te čeka."
          />
        </Reveal>

        <div className="mt-10 space-y-12">
          {groups.map((g) => (
            <div key={g}>
              <h3 className="font-head text-lg sm:text-xl font-semibold text-[#1B3A6B] flex items-center gap-2.5">
                <VideoIcon className="w-5 h-5 text-[#4A90D9]" /> {g}
              </h3>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {videos
                  .filter((v) => (v.package || "Video lekcije") === g)
                  .map((v, i) => {
                    const id = ytId(v.url);
                    return (
                      <Reveal key={v.id} delay={i * 70}>
                        <article
                          data-testid={`video-card-${v.id}`}
                          className="h-full flex flex-col rounded-3xl border border-[#E2E8F0] bg-white overflow-hidden shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5"
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
                            <PlayCircle className="relative w-14 h-14 text-[#D4AF37] transition-transform duration-500 group-hover:scale-110" />
                          </div>
                          <div className="p-6 flex flex-col flex-1">
                            <h4 className="font-head text-base sm:text-lg font-semibold text-[#0A1F44]">{v.title}</h4>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
