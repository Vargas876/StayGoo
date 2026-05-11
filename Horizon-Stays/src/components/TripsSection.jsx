import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { useAuthUser } from "../useAuthUser";
import { getMyBookings } from "../api";

export function TripsSection() {
  const user = useAuthUser();
  const [activeReservation, setActiveReservation] = useState(0);
  const [isImageFading, setIsImageFading] = useState(false);
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await getMyBookings();
        if (data && Array.isArray(data)) {
            setMyBookings(data);
        }
      } catch (error) {
        console.error("Error al cargar mis reservas de viaje:", error);
      }
    }
    loadBookings();
  }, []);

  const programmedReservations = myBookings.length > 0 ? myBookings.map(b => {
    const start = b.start_date ? new Date(b.start_date) : new Date();
    const end = b.end_date ? new Date(b.end_date) : new Date();
    
    let startStr = "TBD";
    let endStr = "TBD";
    try {
        startStr = start.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
        endStr = end.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    } catch(e){}
    
    let diffDays = Math.ceil((start - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) diffDays = 0;

    return {
      id: b.id_booking,
      title: b.housing?.name || "Alojamiento",
      dates: `${startStr} - ${endStr}`,
      image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80",
      countdown: { days: String(diffDays).padStart(2, "0"), hrs: "00", min: "00" }
    };
  }) : [
    {
      id: "no-res",
      title: "No tienes reservas aún",
      dates: "Planea tu próximo destino con nosotros",
      image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1400&q=80",
      countdown: { days: "0", hrs: "0", min: "0" }
    }
  ];

  const hasCarousel = programmedReservations.length > 1;
  const currentReservation = programmedReservations[activeReservation] || programmedReservations[0];

  const changeReservation = (computeNextIndex) => {
    if (isImageFading) {
      return;
    }

    setIsImageFading(true);

    window.setTimeout(() => {
      setActiveReservation(computeNextIndex);

      window.requestAnimationFrame(() => {
        setIsImageFading(false);
      });
    }, 190);
  };

  const goToPrevious = () => {
    changeReservation((prev) =>
      prev === 0 ? programmedReservations.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    changeReservation((prev) => (prev + 1) % programmedReservations.length);
  };

  // Safe fallback if user.name contains "undefined"
  const displayName = (typeof user?.name === "string" && !user.name.includes("undefined")) ? user.name : "Viajero";

  return (
    <>
      <header className="memberWelcome">
        <h1>
          Bienvenido de nuevo, <span>{displayName}</span>
        </h1>
      </header>

      <section className="memberTopGrid">
        <article className="memberSpotlightCard">
          <img
            className={`spotlightImage ${isImageFading ? "isFading" : ""}`}
            key={currentReservation.id}
            src={currentReservation.image}
            alt={currentReservation.title}
          />

          {hasCarousel ? (
            <div
              className="spotlightCarouselControls"
              aria-label="Controles del carrusel"
            >
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Reserva anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Siguiente reserva"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : null}

          <aside className="quickTagPanel">
            <h3>Acciones rápidas</h3>
            <button type="button">
              <span>
                <ShieldCheck size={14} /> Contactar host
              </span>
              <ChevronRight size={16} />
            </button>
          </aside>

          <div className="spotlightOverlay">
            <div className="spotlightInfo">
              <small>PRÓXIMA EXPERIENCIA</small>
              <h3>{currentReservation?.title}</h3>

              <div className="spotlightMetaRow">
                <p>{currentReservation?.dates}</p>

                {hasCarousel ? (
                  <div className="spotlightDots" aria-hidden="true">
                    {programmedReservations.map((reservation, index) => (
                      <span
                        className={index === activeReservation ? "isActive" : ""}
                        key={reservation.id}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {currentReservation.id !== "no-res" && (
                <div className="spotlightCountdown">
                <div>
                    <strong>{currentReservation?.countdown?.days}</strong>
                    <span>Días</span>
                </div>
                <div>
                    <strong>{currentReservation?.countdown?.hrs}</strong>
                    <span>Horas</span>
                </div>
                <div>
                    <strong>{currentReservation?.countdown?.min}</strong>
                    <span>Minutos</span>
                </div>
                </div>
            )}
          </div>
        </article>
      </section>
    </>
  );
}
