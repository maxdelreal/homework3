import { useState, useEffect } from "react";

const API_KEY = "faafa7b6f63690c3dd3b9dbf80f1e298";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

function App() {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [error, setError] = useState("");

  // Debounce: wait 400ms after typing stops before committing the search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch whenever the page or the committed search term changes
  useEffect(() => {
    async function fetchMovies() {
      const url =
        searchTerm === ""
          ? `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${currentPage}`
          : `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchTerm)}&page=${currentPage}`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`TMDB responded with status ${response.status}`);
        }

        const data = await response.json();

        setMovies(data.results);
        setTotalPages(Math.min(data.total_pages, 500));
        setError("");
      } catch (err) {
        console.error(err);
        setMovies([]);
        setError(err.message);
      }
    }

    fetchMovies();
  }, [currentPage, searchTerm]);

  // Sorting happens during render — no state needed for the sorted copy
  const sortedMovies = [...movies].sort((a, b) => {
    if (sortOption === "date-asc") return a.release_date.localeCompare(b.release_date);
    if (sortOption === "date-desc") return b.release_date.localeCompare(a.release_date);
    if (sortOption === "rating-asc") return a.vote_average - b.vote_average;
    if (sortOption === "rating-desc") return b.vote_average - a.vote_average;
    return 0;
  });

  return (
    <div>
      <header className="banner">
        <h1>Movie Explorer</h1>
      </header>

      <div className="controls">
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="">Sort By</option>
          <option value="date-asc">Release Date (Asc)</option>
          <option value="date-desc">Release Date (Desc)</option>
          <option value="rating-asc">Rating (Asc)</option>
          <option value="rating-desc">Rating (Desc)</option>
        </select>
      </div>

      <main className="movie-grid">
        {error && <p className="message">Could not load movies. {error}</p>}

        {!error && sortedMovies.length === 0 && (
          <p className="message">No movies match that search.</p>
        )}

        {sortedMovies.map((movie) => (
          <div className="movie-card" key={movie.id}>
            <img
              src={movie.poster_path ? IMAGE_URL + movie.poster_path : "https://placehold.co/500x750?text=No+Poster"}
              alt={`${movie.title} poster`}
            />
            <h3>{movie.title}</h3>
            <p>Release Date: {movie.release_date || "Unknown"}</p>
            <p>Rating: {movie.vote_average}</p>
          </div>
        ))}
      </main>

      <div className="pagination">
        <button
          onClick={() => {
            setCurrentPage(currentPage - 1);
            window.scrollTo(0, 0);
          }}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span>Page {currentPage} of {totalPages}</span>

        <button
          onClick={() => {
            setCurrentPage(currentPage + 1);
            window.scrollTo(0, 0);
          }}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;