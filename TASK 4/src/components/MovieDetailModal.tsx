import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Star, Clock, Film } from "lucide-react";
import type { Movie } from "@/data/movies";
import { fetchMovieDetail, getLargePosterUrl, getBackdropUrl, type TmdbMovieDetail } from "@/data/tmdb";

interface MovieDetailModalProps {
  movie: Movie | null;
  isLiked: boolean;
  onToggleLike: (id: number) => void;
  onClose: () => void;
}

const MovieDetailModal = ({ movie, isLiked, onToggleLike, onClose }: MovieDetailModalProps) => {
  const [detail, setDetail] = useState<TmdbMovieDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!movie?.tmdbId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    fetchMovieDetail(movie.tmdbId).then((d) => {
      setDetail(d);
      setLoading(false);
    });
  }, [movie?.tmdbId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!movie) return null;

  const formatRuntime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-card border border-border shadow-2xl"
        >
          {/* Backdrop image */}
          {detail?.backdropPath && (
            <div className="relative h-48 sm:h-56 overflow-hidden rounded-t-xl">
              <img
                src={getBackdropUrl(detail.backdropPath)}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/70 backdrop-blur-sm text-foreground hover:bg-background/90 transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className={`p-6 ${detail?.backdropPath ? "-mt-16 relative z-10" : ""}`}>
            <div className="flex gap-5">
              {/* Poster */}
              <div className="flex-shrink-0 w-28 sm:w-36">
                {detail?.posterPath ? (
                  <img
                    src={getLargePosterUrl(detail.posterPath)}
                    alt={movie.title}
                    className="w-full rounded-lg shadow-lg aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] rounded-lg bg-secondary flex items-center justify-center">
                    <Film className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-tight">
                  {movie.title}
                </h2>

                {detail?.tagline && (
                  <p className="text-sm text-muted-foreground italic mt-1">{detail.tagline}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                  {movie.year > 0 && <span>{movie.year}</span>}
                  {detail?.runtime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatRuntime(detail.runtime)}
                    </span>
                  )}
                  {detail && detail.voteAverage > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      {detail.voteAverage.toFixed(1)}
                      <span className="text-xs">({detail.voteCount.toLocaleString()})</span>
                    </span>
                  )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Like button */}
                <button
                  onClick={() => onToggleLike(movie.id)}
                  className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isLiked
                      ? "gradient-warm text-primary-foreground shadow-glow"
                      : "bg-secondary text-secondary-foreground hover:text-foreground"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  {isLiked ? "Liked" : "Like"}
                </button>
              </div>
            </div>

            {/* Overview */}
            {loading && (
              <div className="mt-5">
                <div className="h-4 bg-secondary rounded animate-pulse w-full mb-2" />
                <div className="h-4 bg-secondary rounded animate-pulse w-3/4" />
              </div>
            )}
            {detail?.overview && (
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
                {detail.overview}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MovieDetailModal;
