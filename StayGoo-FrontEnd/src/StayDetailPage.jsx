import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import "./StayDetailPage.css";
import PanoramaViewer from "./PanoramaViewer";

registerLocale("es", es);

const defaultGallery = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80"
];

const defaultReviews = [
  {
    name: "Mariana Torres",
    date: "Octubre 2023",
    text: "Increible estancia. Las fotos no alcanzan a mostrar lo bien que se disfruta la vista desde la terraza.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80"
  },
  {
    name: "Sofia Ramirez",
    date: "Septiembre 2023",
    text: "De las mejores estadias que he tenido. Todo se siente premium pero al mismo tiempo muy acogedor.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
  }
];

const clean = (value, fallback) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return value;
};

const formatPrice = (rawPrice) => {
  if (typeof rawPrice !== "string") {
    return "$280/noche";
  }
  if (rawPrice.includes("/night")) {
    return rawPrice.replace("/night", "/noche");
  }
  return rawPrice.includes("/noche") ? rawPrice : `${rawPrice}/noche`;
};

const getGallery = (stay) => {
  const source = [];
  if (Array.isArray(stay.gallery)) {
    source.push(...stay.gallery);
  }
  if (stay.image) {
    source.unshift(stay.image);
  }
  if (stay.coverImage) {
    source.unshift(stay.coverImage);
  }

  const unique = Array.from(new Set(source.filter(Boolean)));
  return [...unique, ...defaultGallery].slice(0, 5);
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toIsoDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().split("T")[0];
};

const calculateNights = (checkIn, checkOut) => {
  if (!(checkIn instanceof Date) || !(checkOut instanceof Date)) {
    return 1;
  }
  const diffTime = checkOut.getTime() - checkIn.getTime();
  if (diffTime <= 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

function StayDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const stayData = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("data");
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }, [location.search]);

  const stay = stayData ?? {};
  const title = clean(stay.title, "Villa Horizonte");
  const locationName = clean(stay.location, clean(stay.cityRegion, "Santorini, Grecia"));
  const rating = clean(stay.rating, "4.9");
  const maxGuests = clean(stay.maxGuests, "2");
  const maxGuestsNumber = Math.max(Number(maxGuests) || 2, 1);
  const price = formatPrice(clean(stay.price, "$280/noche"));
  const description = clean(
    stay.description,
    "Experiencia premium con interiorismo editorial, privacidad y vistas abiertas en una ubicacion privilegiada."
  );
  const amenities = Array.isArray(stay.amenities) && stay.amenities.length > 0
    ? stay.amenities
    : ["Piscina infinita privada", "WiFi de alta velocidad", "Climatizacion central", "Vista panoramica al mar", "Chef privado disponible", "Estacionamiento valet gratuito", "Cocina gourmet", "Servicio completo de lavanderia"];
  const gallery = getGallery(stay);
  const summaryPrice = Number(String(price).replace(/[^0-9.]/g, "")) || 280;
  const hostName = clean(stay.hostName, "Anfitrión");
  const isSuperHost = stay.isSuperHost ?? true;

  const defaultCheckIn = useMemo(() => new Date(), []);
  const defaultCheckOut = useMemo(() => addDays(defaultCheckIn, 5), [defaultCheckIn]);
  const [guestCount, setGuestCount] = useState(Math.min(maxGuestsNumber, 2));
  const [checkInDate, setCheckInDate] = useState(defaultCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckOut);
  const [panoramaOpen, setPanoramaOpen] = useState(false);

  useEffect(() => {
    if (checkOutDate <= checkInDate) {
      setCheckOutDate(addDays(checkInDate, 1));
    }
  }, [checkInDate, checkOutDate]);

  const nights = useMemo(() => calculateNights(checkInDate, checkOutDate), [checkInDate, checkOutDate]);
  const total = summaryPrice * nights;

  const handleReserve = () => {
    const accessRole = window.localStorage.getItem("staygooAccessRole");
    const hasValidRole = accessRole === "host" || accessRole === "traveler";
    const isSessionActive = window.localStorage.getItem("staygooSession") === "true" && hasValidRole;
    if (!isSessionActive) {
      window.localStorage.removeItem("staygooSession");
      window.localStorage.removeItem("staygooAccessRole");
      const redirectTo = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
      navigate(`/login?redirect=${redirectTo}`);
      return;
    }

    const paymentPayload = encodeURIComponent(JSON.stringify({
      title,
      location: locationName,
      rating,
      price: `$${summaryPrice.toLocaleString()}/noche`,
      guests: guestCount,
      nights,
      total,
      image: gallery[0],
      data: stay,
      checkIn: toIsoDate(checkInDate),
      checkOut: toIsoDate(checkOutDate)
    }));

    window.open(`/payment-process.html?data=${paymentPayload}`, "staygoo-payment-tab", "noopener,noreferrer");
  };

  const setShareStatus = (label) => {
    const shareLabel = document.getElementById("detailShareLabel");
    if (!shareLabel) {
      return;
    }

    shareLabel.textContent = label;
    window.setTimeout(() => {
      shareLabel.textContent = "Compartir";
    }, 1600);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title,
      text: `${title} · ${locationName}`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Compartido");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus("Copiado");
        return;
      }

      window.prompt("Copia este enlace:", shareUrl);
      setShareStatus("Listo");
    } catch {
      setShareStatus("Error");
    }
  };

  if (!stayData) {
    return (
      <main className="stayDetailPage">
        <div className="stayDetailPageShell">
          <article className="stayDetailError">No se encontro informacion del alojamiento.</article>
        </div>
      </main>
    );
  }

  return (
    <main className="stayDetailPage">
      <div className="stayDetailPageShell">
        <header>
          <button className="stayDetailBackBtn" type="button" onClick={() => navigate(-1)}>
            ← <span>Volver</span>
          </button>
          <div className="stayDetailTitleRow">
            <h1 className="stayDetailTitle">{title}</h1>
            <div className="stayDetailQuickActions">
              <button className="stayDetailQuickBtn" type="button" onClick={handleShare} id="detailShareBtn">
                ↗ <span id="detailShareLabel">Compartir</span>
              </button>
              <button className="stayDetailQuickBtn" type="button">❤ <span>Guardar</span></button>
            </div>
          </div>
          <p className="stayDetailMeta">
            <span>★ {rating} · 128 reseñas</span>
            <span className="stayDetailDotSep" />
            <span>{locationName}</span>
          </p>
        </header>

        <section className="stayDetailGallery">
          <div className="stayDetailGalleryMain"><img src={gallery[0]} alt="Vista principal del alojamiento" /></div>
          <div className="stayDetailGalleryTile"><img src={gallery[1]} alt="Galeria 1" /></div>
          <div className="stayDetailGalleryTile"><img src={gallery[2]} alt="Galeria 2" /></div>
          <div className="stayDetailGalleryTile"><img src={gallery[3]} alt="Galeria 3" /></div>
          <div className="stayDetailGalleryTile"><img src={gallery[4]} alt="Galeria 4" /></div>
        </section>

        <section className="stayDetailBody">
          <div className="stayDetailLeftCol">
            <article>
              <div className="stayDetailHostingRow">
                <div>
                  <h2>Villa completa, anfitrion: {hostName}</h2>
                  <p>{maxGuests} huespedes <span className="stayDetailDotSep" /> 4 dormitorios <span className="stayDetailDotSep" /> 5 camas <span className="stayDetailDotSep" /> 4.5 baños</p>
                </div>
                <img className="stayDetailHostBadge" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="Perfil del anfitrion" />
              </div>
            </article>

            <article className="stayDetailSection stayDetailFacts">
              {isSuperHost ? (
                <div className="stayDetailFactItem">
                  <span className="stayDetailFactIcon">★</span>
                  <div>
                    <strong>{hostName} es Superhost</strong>
                    <span>Los Superhosts son anfitriones con amplia experiencia y excelentes valoraciones.</span>
                  </div>
                </div>
              ) : null}
              <div className="stayDetailFactItem">
                <span className="stayDetailFactIcon">📍</span>
                <div>
                  <strong>Ubicacion excelente</strong>
                  <span>El 100% de los huespedes recientes califico la ubicacion con 5 estrellas.</span>
                </div>
              </div>
              <div className="stayDetailFactItem">
                <span className="stayDetailFactIcon">✓</span>
                <div>
                  <strong>Cancelacion gratuita por 48 horas</strong>
                  <span>Recibe reembolso total si cambias de opinion dentro de las primeras 48 horas.</span>
                </div>
              </div>
            </article>

            <article className="stayDetailSection">
              <p className="stayDetailDesc">{description}</p>
              <button className="stayDetailShowMore" type="button">Mostrar mas <span>›</span></button>
            </article>

            <article className="stayDetailSection">
              <h3 className="stayDetailReviewsHeader">Comodidades de lujo</h3>
              <div className="stayDetailAmenitiesGrid">
                {amenities.map((item) => (
                  <span className="stayDetailAmenityItem" key={item}>
                    <span className="stayDetailAmenityDot" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </article>

            <article className="stayDetailSection">
              <h3 className="stayDetailReviewsHeader">★ {rating} · 128 reseñas</h3>
              <div className="stayDetailReviewsGrid">
                {defaultReviews.map((review) => (
                  <article className="stayDetailReviewCard" key={review.name}>
                    <div className="stayDetailReviewTop">
                      <img src={review.avatar} alt={review.name} />
                      <div>
                        <strong>{review.name}</strong>
                        <span>{review.date}</span>
                      </div>
                    </div>
                    <p className="stayDetailReviewText">{review.text}</p>
                  </article>
                ))}
              </div>
              <button className="stayDetailMoreBtn" type="button">Ver mas reseñas</button>
            </article>

            <article className="stayDetailSection">
              <h3 className="stayDetailReviewsHeader">Donde estaras</h3>
                <div className="stayDetailLocationMap" onClick={() => setPanoramaOpen(true)} role="button" tabIndex={0} aria-label="Abrir visor 360">
                  <div className="panorama-root panorama-clickable">
                    <PanoramaViewer src={gallery[0]} />
                  </div>
                </div>
              <div className="stayDetailLocationCaption">
                <div>
                  <h4>{locationName}</h4>
                  <p>La villa esta en una de las zonas mas exclusivas, cerca de puntos de interes y rutas escenicas tranquilas.</p>
                </div>
                <button className="stayDetailShowMore" type="button" aria-label="Mas sobre la ubicacion"><span>›</span></button>
              </div>
            </article>
            {panoramaOpen ? (
              <div className="panorama-lightbox" onClick={(e) => { if (e.target === e.currentTarget) setPanoramaOpen(false); }}>
                <button className="panorama-close" type="button" onClick={() => setPanoramaOpen(false)}>Cerrar ✕</button>
                <div className="panorama-lightboxContent">
                  <PanoramaViewer key="lightbox" src={gallery[0]} />
                </div>
              </div>
            ) : null}
          </div>

          <aside className="stayDetailBookingCard">
            <h3 className="stayDetailBookingPrice">${summaryPrice.toLocaleString()} <span>/ noche</span></h3>
            <div className="stayDetailBookingForm">
              <div className="stayDetailBookingDates">
                <div className="stayDetailBookingField">
                  <small>ENTRADA</small>
                  <DatePicker
                    selected={checkInDate}
                    onChange={(date) => {
                      if (date) {
                        setCheckInDate(date);
                        if (checkOutDate <= date) {
                          setCheckOutDate(addDays(date, 1));
                        }
                      }
                    }}
                    selectsStart
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={new Date()}
                    maxDate={checkOutDate || undefined}
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    className="stayDetailBookingDateInput"
                    calendarClassName="stayDetailBookingCalendar"
                    popperClassName="stayDetailBookingPopper"
                    placeholderText="Fecha"
                  />
                </div>
                <div className="stayDetailBookingField">
                  <small>SALIDA</small>
                  <DatePicker
                    selected={checkOutDate}
                    onChange={(date) => {
                      if (date) {
                        setCheckOutDate(date);
                      }
                    }}
                    selectsEnd
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={checkInDate ? addDays(checkInDate, 1) : addDays(new Date(), 1)}
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    className="stayDetailBookingDateInput"
                    calendarClassName="stayDetailBookingCalendar"
                    popperClassName="stayDetailBookingPopper"
                    placeholderText="Fecha"
                  />
                </div>
              </div>

              <div className="stayDetailBookingGuests">
                <div>
                  <small>HUESPEDES</small>
                  <span className="stayDetailGuestCount">{guestCount} {guestCount === 1 ? "huesped" : "huespedes"}</span>
                </div>
                <div className="stayDetailGuestsStepper">
                  <button type="button" onClick={() => setGuestCount((value) => Math.max(1, value - 1))} disabled={guestCount <= 1} aria-label="Disminuir huespedes">−</button>
                  <span>{guestCount}</span>
                  <button type="button" onClick={() => setGuestCount((value) => Math.min(maxGuestsNumber, value + 1))} disabled={guestCount >= maxGuestsNumber} aria-label="Aumentar huespedes">+</button>
                </div>
              </div>
            </div>

            <button className="stayDetailReserveBtn" type="button" onClick={handleReserve}>Reservar ahora</button>
            <p className="stayDetailSubNote">Aun no se te cobrara</p>

            <div className="stayDetailPriceBreakdown">
              <span className="stayDetailPriceRow"><span>${summaryPrice} x {nights} noches</span><span>${(summaryPrice * nights).toLocaleString()}</span></span>
              <span className="stayDetailPriceRow stayDetailPriceTotal"><span>Total antes de impuestos</span><span>${total.toLocaleString()}</span></span>
            </div>

            <p className="stayDetailPriceTip">Este alojamiento es una joya poco comun. Lugares similares suelen reservarse con meses de anticipacion.</p>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default StayDetailPage;