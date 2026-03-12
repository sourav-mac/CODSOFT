import { motion } from "framer-motion";

interface GenreFilterProps {
  genres: string[];
  selectedGenre: string | null;
  onSelectGenre: (genre: string | null) => void;
}

const GenreFilter = ({ genres, selectedGenre, onSelectGenre }: GenreFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectGenre(null)}
        className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selectedGenre === null
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground bg-secondary"
        }`}
      >
        {selectedGenre === null && (
          <motion.div
            layoutId="genre-pill"
            className="absolute inset-0 gradient-warm rounded-full"
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          />
        )}
        <span className="relative z-10">All</span>
      </button>
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => onSelectGenre(genre)}
          className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedGenre === genre
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground bg-secondary"
          }`}
        >
          {selectedGenre === genre && (
            <motion.div
              layoutId="genre-pill"
              className="absolute inset-0 gradient-warm rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative z-10">{genre}</span>
        </button>
      ))}
    </div>
  );
};

export default GenreFilter;
