import { usePokemonData } from "./PokemonDataContext";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "./pageselector"; 
import "./index.css";  

interface Pokemon {
  name: string;
  url: string;
}

const limit = 48;

function SkeletonCard() {
  return <div className="skeleton-card" />;
}

export default function ListView() {
  const { fetchAllList, allPokemons, detailCache, fetchPokemonDetail } = usePokemonData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(Number(searchParams.get("page")) || 0);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [searchMode, setSearchMode] = useState<"name/id" | "type">(
    (searchParams.get("mode") as "name/id" | "type") || "name/id"
  );
  const [sortMode, setSortMode] = useState<"id" | "name" | "stat">(
    (searchParams.get("sort") as "id" | "name" | "stat") || "id"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("order") as "asc" | "desc") || "asc"
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllList().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchMode === "type" && search) {
      allPokemons.forEach((p) => {
        if (!detailCache[p.url]) {
          fetchPokemonDetail(p.url);
        }
      });
    }
  }, [searchMode, search, allPokemons]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (page > 0) params.page = String(page);
    if (searchMode !== "name/id") params.mode = searchMode;
    if (sortMode !== "id") params.sort = sortMode;
    if (sortOrder !== "asc") params.order = sortOrder;
    setSearchParams(params);
  }, [search, page, searchMode, sortMode, sortOrder]);

  const filtered = search
    ? allPokemons.filter((p) => {
        const id = p.url.split("/").filter(Boolean).pop() || "";
        const query = search.toLowerCase();

        if (searchMode === "name/id") {
          return p.name.toLowerCase().includes(query) || id.startsWith(query);
        }

        if (searchMode === "type") {
          const detail = detailCache[p.url];
          return detail && detail.types.some((t) => t.type.name.includes(query));
        }

        return false;
      })
    : allPokemons;

  const sorted = [...filtered].sort((a, b) => {
    const idA = parseInt(a.url.split("/").filter(Boolean).pop() || "0", 10);
    const idB = parseInt(b.url.split("/").filter(Boolean).pop() || "0", 10);

    let result = 0;
    if (sortMode === "id") result = idA - idB;
    if (sortMode === "name") result = a.name.localeCompare(b.name);
    if (sortMode === "stat") {
      const statA = detailCache[a.url]?.stats?.reduce((sum, s) => sum + s.base_stat, 0) || 0;
      const statB = detailCache[b.url]?.stats?.reduce((sum, s) => sum + s.base_stat, 0) || 0;
      result = statA - statB;
    }

    return sortOrder === "asc" ? result : -result;
  });

  const paginated = sorted.slice(page * limit, (page + 1) * limit);

  return (
    <div className="list-container">
      <h2>Search your Pokémon!</h2>
      <div className="list-header">

        <div className="search-bar">
          <input
            type="text"
            placeholder={`Search by ${searchMode}`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);  
            }}
            className="search-input"
          />
          <button
            onClick={() => {
              setSearchMode("type");
              setPage(0);
            }}
            className={`btn ${searchMode === "type" ? "active" : ""}`}
          >
            Type
          </button>
          <button
            onClick={() => {
              setSearchMode("name/id");
              setPage(0);
            }}
            className={`btn ${searchMode === "name/id" ? "active" : ""}`}
          >
            Name/ID
          </button>
          
        </div>

        <div className="sort-bar">
          <span className="sort-label">Sort by:</span>
          <button
            onClick={() => {
              setSortMode("id");
              setPage(0);
            }}
            className={`btn ${sortMode === "id" ? "active" : ""}`}
          >
            ID
          </button>
          <button
            onClick={() => {
              setSortMode("name");
              setPage(0);
            }}
            className={`btn ${sortMode === "name" ? "active" : ""}`}
          >
            Name
          </button>
          <button
            onClick={() => {
              setSortMode("stat");
              setPage(0);
            }}
            className={`btn ${sortMode === "stat" ? "active" : ""}`}
          >
            Base Stats
          </button>

          <span className="order-label">Order:</span>
          <button
            onClick={() => {
              setSortOrder("asc");
              setPage(0);
            }}
            className={`btn ${sortOrder === "asc" ? "active" : ""}`}
          >
            Asc ↑
          </button>
          <button
            onClick={() => {
              setSortOrder("desc");
              setPage(0);
            }}
            className={`btn ${sortOrder === "desc" ? "active" : ""}`}
          >
            Desc ↓
          </button>
        </div>
      </div>

      <div className="pokemon-grid">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
        ) : paginated.length > 0 ? (
          paginated.map((p) => {
            const id = p.url.split("/").filter(Boolean).pop();
            const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
            const detail = detailCache[p.url];

            return (
              <Link to={`/pokemon/${id}`} key={id} className="pokemon-card">
                <img
                  src={imgUrl}
                  alt={p.name}
                  className="pokemon-img"
                  onError={(e) =>{
                    (e.currentTarget as HTMLImageElement).src = `${process.env.PUBLIC_URL}/Poke_Ball.png`;

                  }}
                />
                <p className="pokemon-name">{p.name}</p>
                <p className="pokemon-id">#{id}</p>

                {detail?.types && (
                  <div>
                    {detail.types.map((t, idx) => (
                       <span key={idx} className={`type-badge ${t.type.name}`}>
                        {t.type.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })
        ) : (
          <p>No Pokémon found</p>
        )}
      </div>

      <Pagination
        page={page}
        total={sorted.length}
        limit={limit}
        onPageChange={(newPage) =>  {
          setPage(newPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}


// Pokemon type image source: https://www.deviantart.com/jormxdos/gallery#content
// Pokemon placeholder image for image-missing pokemons:https://pokemon-fano.fandom.com/wiki/Poke_Ball
// Pokemon logo image:https://freebiesupply.com/logos/pokemon-logo/