import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Film, Sparkles, Heart, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { loadMovies, getRecommendations, searchMovies, type Movie } from "@/data/movies";
import MovieCard from "@/components/MovieCard";
import MovieDetailModal from "@/components/MovieDetailModal";
import GenreFilter from "@/components/GenreFilter";
import heroBg from "@/assets/hero-bg.png";

const MOVIES_PER_PAGE = 60;

const Index = () => {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem("cinematch-likes");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    loadMovies().then((movies) => {
      setAllMovies(movies);
      setLoading(false);
    });
  }, []);

  const toggleLike = (id: number) => {
    setLikedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem("cinematch-likes", JSON.stringify(next));
      return next;
    });
  };

  // Extract genres that actually appear in the dataset
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    allMovies.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [allMovies]);

  const filteredMovies = useMemo(() => {
    let result = allMovies;
    if (query) result = searchMovies(query, result);
    if (selectedGenre) result = result.filter((m) => m.genres.includes(selectedGenre));
    return result;
  }, [allMovies, selectedGenre, query]);

  const recommendations = useMemo(
    () => getRecommendations(likedIds, allMovies),
    [likedIds, allMovies]
  );

  const displayMovies = showRecommendations ? recommendations : filteredMovies;

  const totalPages = Math.ceil(displayMovies.length / MOVIES_PER_PAGE);
  const paginatedMovies = displayMovies.slice(
    (page - 1) * MOVIES_PER_PAGE,
    page * MOVIES_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedGenre, query, showRecommendations]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-[42vh] min-h-[300px] overflow-hidden flex items-end">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative z-10 container mx-auto px-6 pb-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-3 mb-2">
              <Film className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                Cine<span className="text-gradient">Match</span>
              </h1>
            </div>
            <p className="text-base text-muted-foreground max-w-lg">
              {allMovies.length.toLocaleString()} movies. Like what you love — we'll recommend the rest.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
          <div className="flex gap-2">
            <button
              onClick={() => setShowRecommendations(false)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !showRecommendations
                  ? "gradient-warm text-primary-foreground shadow-glow"
                  : "bg-secondary text-secondary-foreground hover:text-foreground"
              }`}
            >
              <Film className="h-4 w-4" />
              Browse
            </button>
            <button
              onClick={() => setShowRecommendations(true)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                showRecommendations
                  ? "gradient-warm text-primary-foreground shadow-glow"
                  : "bg-secondary text-secondary-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              For You
              {likedIds.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary-foreground/20 text-[10px]">
                  {likedIds.length}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          {!showRecommendations && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search movies or genres..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}

          {likedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
              {likedIds.length} liked
            </motion.div>
          )}
        </div>

        {/* Genre filter */}
        {!showRecommendations && (
          <LayoutGroup>
            <div className="mb-6">
              <GenreFilter
                genres={availableGenres}
                selectedGenre={selectedGenre}
                onSelectGenre={setSelectedGenre}
              />
            </div>
          </LayoutGroup>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty recommendations */}
        {showRecommendations && likedIds.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">No likes yet</h2>
            <p className="text-muted-foreground">Like some movies first, and we'll find your perfect match.</p>
          </motion.div>
        )}

        {/* Movie Grid */}
        {!loading && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {displayMovies.length.toLocaleString()} movie{displayMovies.length !== 1 && "s"}
                {showRecommendations && " recommended"}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-md bg-secondary text-secondary-foreground disabled:opacity-30 hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-md bg-secondary text-secondary-foreground disabled:opacity-30 hover:text-foreground transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${showRecommendations}-${selectedGenre}-${query}-${page}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3"
              >
                {paginatedMovies.map((movie, i) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isLiked={likedIds.includes(movie.id)}
                    onToggleLike={toggleLike}
                    onSelect={setSelectedMovie}
                    index={i}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Bottom pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-md bg-secondary text-secondary-foreground disabled:opacity-30 hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-md bg-secondary text-secondary-foreground disabled:opacity-30 hover:text-foreground transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {displayMovies.length === 0 && !showRecommendations && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No movies found.</p>
              </div>
            )}
          </>
        )}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          isLiked={likedIds.includes(selectedMovie.id)}
          onToggleLike={toggleLike}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 mt-8 border-t border-border">
        <p className="text-center text-sm text-muted-foreground">
          CineMatch — Content-based recommendation engine · MovieLens dataset
        </p>
      </footer>
    </div>
  );
};

export default Index;
