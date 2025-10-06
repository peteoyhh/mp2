import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePokemonData } from "./PokemonDataContext";
import Pagination from "./pageselector";

const limit = 200;
const types = [
  "normal","fire","water","grass","electric","ice",
  "fighting","poison","ground","flying","psychic","bug",
  "rock","ghost","dragon","dark","steel","fairy"
];

const getIdFromUrl = (u: string) =>
  parseInt(u.split("/").filter(Boolean).pop() || "0", 10);

function SkeletonCard() {
    return <div className="skeleton-card" />;
  }

export default function GalleryView() {
  const { allPokemons, fetchAllList, fetchTypeList, fetchPage } = usePokemonData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedType, setSelectedType] = useState<string | null>(
    searchParams.get("type") || null
  );
  const [page, setPage] = useState<number>(Number(searchParams.get("page")) || 0);

  const [activeList, setActiveList] = useState<any[]>([]);
  const [current, setCurrent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllList();
  }, []);

  useEffect(() => {
    async function loadList() {
      setLoading(true);
      if (selectedType) {
        const list = await fetchTypeList(selectedType);
        setActiveList(list);
      } else {
        setActiveList(allPokemons);
      }
      setLoading(false);
    }
    loadList();
  }, [selectedType, allPokemons]);

  useEffect(() => {
    async function loadPage() {
      if (activeList.length > 0) {
        setLoading(true);
        const data = await fetchPage(activeList, page, limit);
        setCurrent(data);
        setLoading(false);
      }
    }
    loadPage();
  }, [activeList, page]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedType) params.type = selectedType;
    if (page > 0) params.page = String(page);
    setSearchParams(params);
  }, [selectedType, page]);

  const total = activeList.length;

  return (
    <div className="gallery-container">
      <h2 className="gallery-title">Pokémon Gallery</h2>
  
      <div className="type-buttons">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => {
              setSelectedType(selectedType === t ? null : t);
              setPage(0);
            }}
            className={`type-button ${selectedType === t ? "active" : ""}`}
            title={t}
          >
            <img
              src={`${process.env.PUBLIC_URL}/${t}.png`}
              alt={t}
              className="type-icon"
            />
          </button>
        ))}
    


        
        <button
            onClick={() => {
            setSelectedType(null);
            setPage(0);
            }}
            className={`type-button all-button ${selectedType === null ? "active-all" : ""}`}
            >
            All
        </button>
        </div>

      <div className="gallery-grid">
        {loading ? (
            Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
        ) : current.length > 0 ? (
            current.map((p) => {
            const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
            return (
                <Link
                to={`/pokemon/${p.id}`}
                key={p.id}
                className="pokemon-card"
                >
               <img
                src={img}
                alt={p.name}
                className="pokemon-img"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = `${process.env.PUBLIC_URL}/Poke_Ball.png`;
                }}
                />

                <p className="pokemon-name">{p.name}</p>
                <p className="pokemon-id">#{p.id}</p>
                <p className="pokemon-info">{p.height / 10} m ・ {p.weight / 10} kg</p>




                <div>
                {p.types.map((t: any, idx: number) => (
                    <span key={idx} className={`type-badge ${t.type.name}`}>
                    {t.type.name}
                    </span>
                ))}
                </div>
                </Link>
            );
            })
        ) : (
            <p>No Pokémon matched the current filters.</p>
        )}
        </div>

      <Pagination
        page={page}
        total={total}
        limit={limit}
        onPageChange={(newPage) =>  {
          setPage(newPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}      />
    </div>
  );
}


// Pokemon type image source: https://www.deviantart.com/jormxdos/gallery#content
// Pokemon placeholder image for image-missing pokemons:https://pokemon-fano.fandom.com/wiki/Poke_Ball
// Pokemon logo image:https://freebiesupply.com/logos/pokemon-logo/