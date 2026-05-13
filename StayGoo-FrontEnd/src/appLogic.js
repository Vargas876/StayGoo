import { useMemo, useState, useEffect } from "react";
import { getHousings } from "./api"; // ← Importado para obtener los datos reales

const spanishText = {
  navbar: {
    explore: "Explorar",
    login: "Iniciar sesión",
    signUp: "Registrarse",
    profile: "Perfil"
  },
  hero: {
    whereTo: "¿Adónde?",
    destination: "Destino",
    checkIn: "Entrada",
    checkOut: "Salida",
    guests: "Huéspedes",
    addGuests: "Añadir huéspedes",
    searchBtn: "Buscar →",
    datePlaceholder: "Fecha",
    invalidDateRange: "La fecha de salida debe ser posterior a la entrada",
    badge: "REDEFINIENDO EL VIAJE MODERNO",
    headlineLine1: "Escapadas curadas para",
    headlinePrefix: "el",
    headlineAccent: "viajero",
    headlineSuffix: "moderno.",
    description: "Vive el lujo a traves de una mirada editorial. Ofrecemos mas que una estancia: una puerta al alma local.",
    scrollHint: "DESLIZA"
  },
  listings: {
    featuredAccommodations: "Alojamientos Destacados",
    additionalStays: "Alojamientos Disponibles",
    noResults: "No encontramos alojamientos con esos filtros"
  },
  footer: {
    description: "Descubre estancias autenticas en destinos unicos, curadas para experiencias memorables.",
    brandHandle: "@StayGoo",
    rights: "Todos los derechos reservados",
    visualCredit: "Experiencia visual creada por Horizon"
  }
};

export function useAppLogic() {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [apiListings, setApiListings] = useState([]);
  const [heroFilters, setHeroFilters] = useState({
    destination: "",
    checkIn: null,
    checkOut: null,
    guests: ""
  });
  const [appliedFilters, setAppliedFilters] = useState({
    destination: "",
    checkIn: null,
    checkOut: null,
    guests: ""
  });
  const [filterError, setFilterError] = useState("");

  const t = spanishText;

  const categories = useMemo(() => ["Playas", "Cabañas", "Ciudades", "Campo", "Lujo", "Apartamentos", "Hoteles"], []);
  const categoryKeys = useMemo(() => ["beachFront", "cabins", "citystays", "countryside", "luxury", "apartments", "hotels"], []);

  const guestOptions = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => {
        const value = String(index + 1);
        return { value, label: value };
      }),
    []
  );

  const selectedGuestOption = useMemo(
    () => guestOptions.find((option) => option.value === String(heroFilters.guests || "")) || null,
    [guestOptions, heroFilters.guests]
  );

  const guestSelectStyles = useMemo(
    () => ({
      control: (base) => ({
        ...base,
        minHeight: 24,
        height: 24,
        border: "none",
        boxShadow: "none",
        background: "transparent",
        backdropFilter: "none",
        borderRadius: 0,
        cursor: "pointer",
        transition: "none"
      }),
      valueContainer: (base) => ({
        ...base,
        padding: 0
      }),
      placeholder: (base) => ({
        ...base,
        color: "rgba(226, 236, 248, 0.54)",
        fontSize: 19,
        fontWeight: 500
      }),
      singleValue: (base) => ({
        ...base,
        color: "#f8fbff",
        fontSize: 19,
        fontWeight: 500
      }),
      menu: (base) => ({
        ...base,
        marginTop: 8,
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(167, 189, 219, 0.5)",
        background: "rgba(34, 47, 63, 0.92)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 34px rgba(6, 14, 23, 0.34)",
        animation: "guestMenuIn 220ms cubic-bezier(0.22, 1, 0.36, 1)"
      }),
      menuList: (base) => ({
        ...base,
        maxHeight: 220,
        padding: 6
      }),
      option: (base, state) => ({
        ...base,
        borderRadius: 10,
        marginBottom: 2,
        background: state.isSelected
          ? "linear-gradient(135deg, #f05f63, #e34a5b)"
          : state.isFocused
            ? "rgba(255, 255, 255, 0.1)"
            : "transparent",
        color: "#f1f6ff",
        fontWeight: state.isSelected ? 700 : 600,
        cursor: "pointer"
      }),
      dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? "#f1f6ff" : "rgba(225, 237, 250, 0.82)",
        padding: 0
      }),
      clearIndicator: (base) => ({
        ...base,
        color: "rgba(225, 237, 250, 0.82)",
        padding: 0
      }),
      indicatorSeparator: () => ({
        display: "none"
      })
    }),
    []
  );

  useEffect(() => {
    async function fetchListings() {
      try {
        const data = await getHousings();
        const categoryMap = {
          'Apartamento': 'apartments',
          'Cabaña': 'cabins',
          'Casa': 'countryside',
          'Habitación': 'citystays'
        };
        const mapped = data.map((item, i) => {
          const typeName = item.type_housing ? item.type_housing.name : "";
          const mappedCategory = categoryMap[typeName] || "luxury";
          
          return {
            id: item.id_housing.toString(),
            title: item.name || "Sin título",
            category: mappedCategory,
          location: item.address ? `${item.address}, ${item.city}` : item.city || "Ciudad Desconocida",
          maxGuests: item.capacity || 2,
          price: `$${item.price_per_night || 0}`,
          rating: 4.8,
          featured: i < 3,
          image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
          hostName: Array.isArray(item.host) ? (item.host[0]?.name || "Anfitrión") : (item.host?.name || "Anfitrión"),
          isSuperHost: true // Mockeando superhost por ahora
        };
      });
        setApiListings(mapped);
      } catch (err) {
        console.error("Error cargando listings para App:", err);
      }
    }
    fetchListings();
  }, []);

  const filtered = useMemo(() => {
    const activeCategoryKey =
      activeCategoryIndex === null ? null : categoryKeys[activeCategoryIndex] || null;

    return apiListings.filter((listing) => {
      const quickText = search.trim().toLowerCase();
      const destination = appliedFilters.destination.trim().toLowerCase();
      const guests = Number(appliedFilters.guests || 0);

      const matchesQuickSearch =
        !quickText ||
        listing.title.toLowerCase().includes(quickText) ||
        listing.location.toLowerCase().includes(quickText);

      const matchesDestination =
        !destination ||
        listing.title.toLowerCase().includes(destination) ||
        listing.location.toLowerCase().includes(destination);

      const matchesGuests = !guests || listing.maxGuests >= guests;
      const matchesCategory = !activeCategoryKey || activeCategoryKey === "all" || listing.category === activeCategoryKey;

      return matchesQuickSearch && matchesDestination && matchesGuests && matchesCategory;
    });
  }, [search, appliedFilters, activeCategoryIndex, categoryKeys, apiListings]);

  const featuredListings = useMemo(
    () => filtered.filter((listing) => listing.featured),
    [filtered]
  );

  const additionalListings = useMemo(
    () => filtered.filter((listing) => !listing.featured),
    [filtered]
  );

  const handleHeroFilterChange = (field, value) => {
    setHeroFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryClick = (index) => {
    setActiveCategoryIndex((prev) => (prev === index ? null : index));
  };

  const applyHeroFilters = () => {
    if (
      heroFilters.checkIn &&
      heroFilters.checkOut &&
      heroFilters.checkOut.getTime() <= heroFilters.checkIn.getTime()
    ) {
      setFilterError(t.hero.invalidDateRange);
      return;
    }

    setFilterError("");
    setAppliedFilters({ ...heroFilters });
  };

  const openListingDetails = (listing) => {
    const payload = encodeURIComponent(
      JSON.stringify({
        ...listing,
        sectionTitle: listing.featured
          ? t.listings.featuredAccommodations
          : t.listings.additionalStays
      })
    );

    window.open(`/stay-detail.html?data=${payload}`, "staygoo-detail-tab", "noopener,noreferrer");
  };

  return {
    activeCategoryIndex,
    search,
    setSearch,
    heroFilters,
    filterError,
    t,
    categories,
    guestOptions,
    selectedGuestOption,
    guestSelectStyles,
    featuredListings,
    additionalListings,
    handleHeroFilterChange,
    handleCategoryClick,
    applyHeroFilters,
    openListingDetails
  };
}
