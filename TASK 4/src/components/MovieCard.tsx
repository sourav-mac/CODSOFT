import { Heart, Film } from "lucide-react";
import { motion } from "framer-motion";
import type { Movie } from "@/data/movies";
import { useState, useEffect } from "react";
import { fetchPosterPath, getPosterUrl } from "@/data/tmdb";

interface MovieCardProps {
  movie: Movie;
  isLiked: boolean;
  onToggleLike: (id: number) => void;
  onSelect: (movie: Movie) => void;
  index?: number;
}

// Genre-based color palette for placeholder posters
const genreColors: Record<string, string> = {
  Action: "from-red-900 to-orange-900",
  Adventure: "from-amber-900 to-yellow-800",
  Animation: "from-sky-800 to-cyan-700",
  Comedy: "from-yellow-800 to-amber-700",
  Crime: "from-slate-900 to-zinc-800",
  Drama: "from-indigo-900 to-purple-900",
  Fantasy: "from-violet-900 to-fuchsia-800",
  Horror: "from-gray-950 to-red-950",
  Mystery: "from-slate-900 to-indigo-950",
  Romance: "from-rose-900 to-pink-800",
  "Sci-Fi": "from-cyan-900 to-blue-950",
  Thriller: "from-zinc-900 to-gray-950",
  War: "from-stone-900 to-zinc-800",
  Documentary: "from-emerald-900 to-teal-800",
  Musical: "from-fuchsia-900 to-pink-800",
  Western: "from-orange-900 to-amber-900",
  Children: "from-sky-700 to-blue-600",
  "Film-Noir": "from-gray-950 to-black",
};

function getGradient(genres: string[]): string {
  for (const g of genres) {
    if (genreColors[g]) return genreColors[g];
  }
  return "from-zinc-900 to-slate-800";
}

const MovieCard = ({ movie, isLiked, onToggleLike, onSelect, index = 0 }: MovieCardProps) => {
  const gradient = getGradient(movie.genres);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    if (movie.tmdbId) {
      fetchPosterPath(movie.tmdbId).then((path) => {
        if (path) setPosterUrl(getPosterUrl(path));
      });
    }
  }, [movie.tmdbId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
      className="group relative overflow-hidden rounded-lg shadow-card cursor-pointer"
      onClick={() => onSelect(movie)}
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={movie.title}
          className="aspect-[2/3] w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className={`aspect-[2/3] bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-4 text-center`}>
          <Film className="h-8 w-8 text-foreground/20 mb-3" />
          <h3 className="font-display text-sm font-semibold text-foreground/80 leading-tight line-clamp-3">
            {movie.title}
          </h3>
          {movie.year > 0 && (
            <p className="text-xs text-foreground/40 mt-1">{movie.year}</p>
          )}
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <h3 className="font-display text-sm font-semibold text-foreground leading-tight">
          {movie.title}
        </h3>
        {movie.year > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">{movie.year}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {movie.genres.slice(0, 3).map(genre => (
            <span
              key={genre}
              className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Like button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleLike(movie.id);
        }}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-background/70 backdrop-blur-sm transition-all hover:bg-background/90 hover:scale-110 active:scale-95"
        aria-label={isLiked ? "Unlike" : "Like"}
      >
        <Heart
          className={`h-3.5 w-3.5 transition-colors ${
            isLiked ? "fill-primary text-primary" : "text-foreground/70"
          }`}
        />
      </button>
    </motion.div>
  );
};

export default MovieCard;
