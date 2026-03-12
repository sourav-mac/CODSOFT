const TMDB_API_KEY = "e8b7f46b022fa94866e118251b453fd6";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";
const IMAGE_BASE_LARGE = "https://image.tmdb.org/t/p/w500";

const posterCache = new Map<number, string | null>();
const detailCache = new Map<number, TmdbMovieDetail | null>();

export interface TmdbMovieDetail {
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  runtime: number | null;
  voteAverage: number;
  voteCount: number;
  tagline: string;
  releaseDate: string;
}

export function getPosterUrl(path: string): string {
  return `${IMAGE_BASE}${path}`;
}

export function getLargePosterUrl(path: string): string {
  return `${IMAGE_BASE_LARGE}${path}`;
}

export function getBackdropUrl(path: string): string {
  return `https://image.tmdb.org/t/p/w780${path}`;
}

export async function fetchPosterPath(tmdbId: number): Promise<string | null> {
  if (posterCache.has(tmdbId)) return posterCache.get(tmdbId)!;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    if (!res.ok) {
      posterCache.set(tmdbId, null);
      return null;
    }
    const data = await res.json();
    const path = data.poster_path || null;
    posterCache.set(tmdbId, path);
    return path;
  } catch {
    posterCache.set(tmdbId, null);
    return null;
  }
}

export async function fetchMovieDetail(tmdbId: number): Promise<TmdbMovieDetail | null> {
  if (detailCache.has(tmdbId)) return detailCache.get(tmdbId)!;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    if (!res.ok) {
      detailCache.set(tmdbId, null);
      return null;
    }
    const data = await res.json();
    const detail: TmdbMovieDetail = {
      overview: data.overview || "",
      posterPath: data.poster_path || null,
      backdropPath: data.backdrop_path || null,
      runtime: data.runtime || null,
      voteAverage: data.vote_average || 0,
      voteCount: data.vote_count || 0,
      tagline: data.tagline || "",
      releaseDate: data.release_date || "",
    };
    detailCache.set(tmdbId, detail);
    // Also cache the poster path
    if (!posterCache.has(tmdbId)) {
      posterCache.set(tmdbId, detail.posterPath);
    }
    return detail;
  } catch {
    detailCache.set(tmdbId, null);
    return null;
  }
}
