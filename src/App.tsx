import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link,useLocation } from "react-router-dom";
import ListView from "./ListView";
import GalleryView from "./GalleryView";
import DetailView from "./DetailView";
import { PokemonDataProvider } from "./PokemonDataContext";
import "./index.css"; 
// Pokemon type image source: https://www.deviantart.com/jormxdos/gallery#content
// Pokemon placeholder image for image-missing pokemons:https://pokemon-fano.fandom.com/wiki/Poke_Ball
// Pokemon logo image:https://freebiesupply.com/logos/pokemon-logo/

function Header() {
  return (
    <header className="header">
      <img
        src={`${process.env.PUBLIC_URL}/Poke_Ball.png`}
        alt="Pokéball"
        className="header-logo left-logo"
      />

      <span className="header-title">Pokémon Data Explorer</span>

      <img
        src={`${process.env.PUBLIC_URL}/Pokemon.png`}
        alt="Pikachu"
        className="header-logo right-logo"
      />
    </header>
  );
}




function Navbar() {
  const { pathname } = useLocation();
  const listActive = pathname.startsWith("/list");
  const galleryActive = pathname.startsWith("/gallery");

  return (
    <nav className="navbar">
      <Link to="/list" className={`nav-link ${listActive ? "active" : ""}`}>
        Pokémon List
      </Link>
      <Link to="/gallery" className={`nav-link ${galleryActive ? "active" : ""}`}>
        Gallery
      </Link>
    </nav>
  );
}

export default function App() {
  return (
    <PokemonDataProvider> 
      <BrowserRouter basename="/mp2">
        <Header /> 
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/list" />} />
          <Route path="/list" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/pokemon/:id" element={<DetailView />} />
        </Routes>
      </BrowserRouter>
    </PokemonDataProvider>
  );
}