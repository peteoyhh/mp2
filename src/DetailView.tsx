import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { usePokemonData } from "./PokemonDataContext";
import "./index.css";

interface PokemonDetail {
  id: number;
  name: string;
  sprites: { front_default: string };
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  height: number;
  weight: number;
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  held_items: { item: { name: string } }[];
  forms: { name: string }[];
}

function StatBar({ statName, value }: { statName: string; value: number }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      const width = Math.min((value / 150) * 100, 100);
      barRef.current.className = `bar width-${Math.round(width/20)*20}`;    }
  }, [value]);

  return (
    <div className="stat-bar">
      <div ref={barRef} className={`stat-bar-fill ${statName.toLowerCase()}`} />
    </div>
  );
}

export default function DetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchPokemonDetail } = usePokemonData();

  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchPokemonDetail(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then((res) => {
          setPokemon(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching detail:", err);
          setLoading(false);
        });
    }
  }, [id, fetchPokemonDetail]);

  if (!pokemon) return <p>No Pokémon data found.</p>;

  const radarData = pokemon.stats.map((s) => ({
    stat: s.stat.name
      .replace("special-attack", "SpA")
      .replace("special-defense", "SpD")
      .replace("attack", "Atk")
      .replace("defense", "Def")
      .replace("speed", "Spe")
      .replace("hp", "HP"),
    value: s.base_stat,
  }));

  const currentId = parseInt(id || "1", 10);
  const totalPokemons = 10277;
  const prevId = currentId > 1 ? currentId - 1 : totalPokemons;
  const nextId = currentId < totalPokemons ? currentId + 1 : 1;

  return (
    <div className="detail-container">
      <div className="detail-card">
        <h2 className="detail-title">
          #{pokemon.id} {pokemon.name}
        </h2>

        <div className="detail-layout">
          <div className="detail-left">
            <img
              src={ pokemon.sprites.front_default ||`${process.env.PUBLIC_URL}/Poke_Ball_small.png`
              }
              alt={pokemon.name}
              className="pokemon-image"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `${process.env.PUBLIC_URL}/Poke_Ball_small.png`;
              }}
            />
          </div>

          <div className="detail-right">
            <div className="type-section">
              {pokemon.types.map((t, idx) => (
                <span key={idx} className={`type-badge ${t.type.name}`}>
                  {t.type.name}
                </span>
              ))}
            </div>

            <div className="info-section">
              <p>Height: {pokemon.height / 10} m</p>
              <p>Weight: {pokemon.weight / 10} kg</p>
              <p>
                Abilities:&nbsp;
                {pokemon.abilities.map((a, idx) => (
                  <span key={idx}>
                    {a.ability.name}
                    {a.is_hidden ? " (Hidden)" : ""}
                    {idx < pokemon.abilities.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
              {pokemon.held_items.length > 0 && (
                <p>
                  Held Items: {pokemon.held_items.map((h) => h.item.name).join(", ")}
                </p>
              )}
              {pokemon.forms.length > 0 && (
                <p>Forms: {pokemon.forms.map((f) => f.name).join(", ")}</p>
              )}
            </div>
          </div>
        </div>

        <div className="radar-wrapper">
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="stat" />
              <PolarRadiusAxis angle={30} domain={[0, 180]} />
              <Radar
                name={pokemon.name}
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <h3 className="stats-title"></h3>
        <div className="stats-bars">
          {pokemon.stats.map((s, idx) => {
            const key = s.stat.name
              .replace("special-attack", "sp.atk")
              .replace("special-defense", "sp.def")
              .replace("attack", "atk")
              .replace("defense", "def")
              .replace("speed", "spe")
              .replace("hp", "hp")
              .toLowerCase();

            const MAX_STAT = 180; 
            const rawPct = (s.base_stat / MAX_STAT) * 100;
            const clamped = Math.max(0, Math.min(100, rawPct));
            const snapped = Math.round(clamped / 5) * 5;
            const widthClass = `width-${snapped}`;

            return (
              <div key={idx} className="stat-row">
                <span className="stat-label">
                  {key.toUpperCase().replace(".", "")}
                </span>
                <div className="stat-bar">
                  <div className={`stat-bar-fill ${key} ${widthClass}`}></div>
                </div>
                <span className="stat-value">{s.base_stat}</span>
              </div>
            );
          })}

          <div className="stat-total">
            Total: {pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)}
          </div>
        </div>

        <div className={`nav-buttons ${!prevId ? "single-arrow" : ""}`}>
          {prevId && (
            <button onClick={() => navigate(`/pokemon/${prevId}`)} className="btn-nav">
              ←
            </button>
          )}
          <button onClick={() => navigate(`/pokemon/${nextId}`)} className="btn-nav">
            →
          </button>
        </div>
      </div>
    </div>
  );
}



// Pokemon type image source: https://www.deviantart.com/jormxdos/gallery#content
// Pokemon placeholder image for image-missing pokemons:https://pokemon-fano.fandom.com/wiki/Poke_Ball
// Pokemon logo image:https://freebiesupply.com/logos/pokemon-logo/