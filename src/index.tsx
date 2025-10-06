import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


if (sessionStorage.redirect) {
  const redirectPath = sessionStorage.redirect;
  delete sessionStorage.redirect;
  window.history.replaceState(null, '', redirectPath);
}



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// Pokemon type image source: https://www.deviantart.com/jormxdos/gallery#content
// Pokemon placeholder image for image-missing pokemons:https://pokemon-fano.fandom.com/wiki/Poke_Ball
// Pokemon logo image:https://freebiesupply.com/logos/pokemon-logo/
reportWebVitals();
