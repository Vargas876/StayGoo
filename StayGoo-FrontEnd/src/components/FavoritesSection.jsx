import { useEffect, useState } from "react";
import { Heart, Star, MapPin, Users } from "lucide-react";
import { getHousings } from "../api";
import { mapHousingsToListings } from "../utils/listingMapper";
import {
  getFavoriteIds,
  toggleFavoriteId,
  FAVORITES_CHANGED_EVENT,
} from "../utils/favoritesStorage";

export function FavoritesSection() {
  const [favorites, setFavorites] = useState(getFavoriteIds);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncFavorites = () => setFavorites(getFavoriteIds());
    window.addEventListener(FAVORITES_CHANGED_EVENT, syncFavorites);
    window.addEventListener("storage", syncFavorites);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      try {
        const data = await getHousings();
        if (!cancelled) {
          setListings(mapHousingsToListings(data));
        }
      } catch (err) {
        console.error("Error cargando favoritos:", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadListings();
    return () => {
      cancelled = true;
    };
  }, []);

  const favoriteListings = listings.filter((listing) =>
    favorites.includes(String(listing.id))
  );

  const handleRemoveFavorite = (listingId) => {
    const updated = toggleFavoriteId(listingId);
    setFavorites(updated);
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
        {isLoading ? (
          <div className="emptyFavoritesState">
            <p>Cargando tus favoritos...</p>
          </div>
        ) : favoriteListings.length === 0 ? (
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
                  onClick={() => handleRemoveFavorite(listing.id)}
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
