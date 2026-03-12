export interface Movie {
  id: number;
  title: string;
  year: number;
  genres: string[];
  tmdbId?: number;
}

export const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Drama", "Fantasy", "Horror", "Mystery", "Romance",
  "Sci-Fi", "Thriller", "War", "Documentary", "Musical",
  "Western", "Children", "Film-Noir"
] as const;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function extractYear(title: string): { cleanTitle: string; year: number } {
  const match = title.match(/\((\d{4})\)\s*$/);
  if (match) {
    return {
      cleanTitle: title.replace(/\s*\(\d{4}\)\s*$/, '').trim(),
      year: parseInt(match[1], 10),
    };
  }
  return { cleanTitle: title, year: 0 };
}

let cachedMovies: Movie[] | null = null;
let cachedLinks: Map<number, number> | null = null;

export async function loadLinks(): Promise<Map<number, number>> {
  if (cachedLinks) return cachedLinks;
  const res = await fetch('/data/links.csv');
  const text = await res.text();
  const lines = text.trim().split('\n');
  const map = new Map<number, number>();
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    const movieId = parseInt(parts[0], 10);
    const tmdbId = parseInt(parts[2], 10);
    if (!isNaN(movieId) && !isNaN(tmdbId)) {
      map.set(movieId, tmdbId);
    }
  }
  cachedLinks = map;
  return map;
}

export async function loadMovies(): Promise<Movie[]> {
  if (cachedMovies) return cachedMovies;
  
  const [moviesRes, links] = await Promise.all([
    fetch('/data/movies.csv'),
    loadLinks(),
  ]);
  const text = await moviesRes.text();
  const lines = text.trim().split('\n');
  
  const movies: Movie[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i]);
    if (parts.length < 3) continue;
    const id = parseInt(parts[0], 10);
    const { cleanTitle, year } = extractYear(parts[1]);
    const genres = parts[2] === '(no genres listed)' ? [] : parts[2].split('|').map(g => g.trim()).filter(Boolean);
    movies.push({
      id,
      title: cleanTitle,
      year,
      genres,
      tmdbId: links.get(id),
    });
  }
  
  cachedMovies = movies;
  return movies;
}

export function getRecommendations(likedMovieIds: number[], allMovies: Movie[]): Movie[] {
  if (likedMovieIds.length === 0) return [];

  const likedMovies = allMovies.filter(m => likedMovieIds.includes(m.id));

  const genreScores: Record<string, number> = {};
  likedMovies.forEach(movie => {
    movie.genres.forEach(genre => {
      genreScores[genre] = (genreScores[genre] || 0) + 1;
    });
  });

  const candidates = allMovies
    .filter(m => !likedMovieIds.includes(m.id))
    .map(movie => {
      let score = 0;
      movie.genres.forEach(genre => {
        score += genreScores[genre] || 0;
      });
      // Boost newer movies slightly
      if (movie.year > 0) score += (movie.year - 1900) / 200;
      return { movie, score };
    })
    .sort((a, b) => b.score - a.score);

  return candidates.slice(0, 50).map(c => c.movie);
}

export function searchMovies(query: string, movies: Movie[]): Movie[] {
  const q = query.toLowerCase().trim();
  if (!q) return movies;
  return movies.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.genres.some(g => g.toLowerCase().includes(q))
  );
}
