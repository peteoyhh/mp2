import React, { createContext, useContext, useState } from "react";
import axios from "axios";

interface Pokemon {
  name: string;
  url: string;
}

export interface PokemonDetail {
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

interface PokemonDataContextType {
  allPokemons: Pokemon[];
  typeListCache: Record<string, Pokemon[]>;
  detailCache: Record<string, PokemonDetail>;
  fetchAllList: () => Promise<void>;
  fetchTypeList: (type: string) => Promise<Pokemon[]>;
  fetchPokemonDetail: (url: string) => Promise<PokemonDetail>;
  fetchPage: (list: Pokemon[], page: number, limit?: number) => Promise<PokemonDetail[]>;
}

const PokemonDataContext = createContext<PokemonDataContextType | null>(null);

export function PokemonDataProvider({ children }: { children: React.ReactNode }) {
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [typeListCache, setTypeListCache] = useState<Record<string, Pokemon[]>>({});
  const [detailCache, setDetailCache] = useState<Record<string, PokemonDetail>>({});

  const fetchAllList = async () => {
    if (allPokemons.length > 0) return;
    const res = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=100000");
    const list: Pokemon[] = res.data.results;
    setAllPokemons(list);
  
    Promise.all(
      list.map((p) => fetchPokemonDetail(p.url).catch(() => null))
    ).then(() => {
      console.log(" All Pokémon details cached");
    });
  };

  const fetchTypeList = async (type: string) => {
    if (typeListCache[type]) return typeListCache[type];
    const res = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
    const list: Pokemon[] = res.data.pokemon.map((x: any) => x.pokemon);
    setTypeListCache((prev) => ({ ...prev, [type]: list }));
    return list;
  };

  const fetchPokemonDetail = async (url: string): Promise<PokemonDetail> => {
    if (detailCache[url]) return detailCache[url];
    const res = await axios.get(url);

    const detail: PokemonDetail = {
      id: res.data.id,
      name: res.data.name,
      sprites: res.data.sprites,
      types: res.data.types,
      stats: res.data.stats,
      height: res.data.height,
      weight: res.data.weight,
      abilities: res.data.abilities,
      held_items: res.data.held_items,
      forms: res.data.forms,
    };

    setDetailCache((prev) => ({ ...prev, [url]: detail }));
    return detail;
  };

  const fetchPage = async (
    list: Pokemon[],
    page: number,
    limit = 20
  ): Promise<PokemonDetail[]> => {
    const start = page * limit;
    const end = start + limit;
    const slice = list.slice(start, end);

    const details = await Promise.all(slice.map((p) => fetchPokemonDetail(p.url)));
    return details;
  };

  return (
    <PokemonDataContext.Provider
      value={{
        allPokemons,
        typeListCache,
        detailCache,
        fetchAllList,
        fetchTypeList,
        fetchPokemonDetail,
        fetchPage,
      }}
    >
      {children}
    </PokemonDataContext.Provider>
  );
}

export function usePokemonData() {
  const ctx = useContext(PokemonDataContext);
  if (!ctx) throw new Error("usePokemonData must be used within PokemonDataProvider");
  return ctx;
}