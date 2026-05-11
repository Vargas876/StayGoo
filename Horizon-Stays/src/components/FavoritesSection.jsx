import { useState } from "react";
import { Heart, Star, MapPin, Users } from "lucide-react";
import { listings } from "../data";

export function FavoritesSection() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = window.localStorage.getItem("staygoFavorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const favoriteListings = listings.filter((listing) =>
    favorites.includes(listing.id)
  );

  const toggleFavorite = (listingId) => {
    setFavorites((prev) => {
      const updated = prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId];
      window.localStorage.setItem("staygoFavorites", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <>
      <header className="memberWelcome">
        <h1>
          Mis <span>favoritos</span>
        </h1>
        <p>
          {favoriteListings.length === 0
            ? "Marca tus alojamientos favoritos para guardarlos aqui."
            : favoriteListings.length === 1
              ? "Tienes 1 alojamiento favorito."
              : `Tienes ${favoriteListings.length} alojamientos favoritos.`}
        </p>
      </header>

      <section className="favoritesGrid">
        {favoriteListings.length === 0 ? (
          <div className="emptyFavoritesState">
            <Heart size={48} strokeWidth={1.5} />
            <h3>Aun no tienes favoritos</h3>
            <p>Explora alojamientos y agrega tus favoritos para verlos aqui.</p>
          </div>
        ) : (
          favoriteListings.map((listing) => (
            <article key={listing.id} className="favoriteCard">
              <div className="favoriteImageWrap">
                <img src={listing.image} alt={listing.title} />
                <button
                  className="removeFavoriteBtn"
                  onClick={() => toggleFavorite(listing.id)}
                  aria-label={`Quitar ${listing.title} de favoritos`}
                  type="button"
                >
                  <Heart size={20} fill="currentColor" />
                </button>
                <div className="favoriteRating">
                  <Star size={14} fill="currentColor" />
                  <span>{listing.rating}</span>
                </div>
              </div>
              <div className="favoriteCardContent">
                <h3>{listing.title}</h3>
                <p className="favoriteLocation">
                  <MapPin size={14} />
                  {listing.location}
                </p>
                <div className="favoriteCardFooter">
                  <span className="favoritePrice">{listing.price}</span>
                  <div className="favoriteGuests">
                    <Users size={14} />
                    {listing.maxGuests} huespedes
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </>
  );
}
