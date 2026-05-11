import HouseLoader from "./components/HouseLoader";
import "./LoaderPreviewPage.css";

function LoaderPreviewPage() {

  return (
    <main className="loaderPreviewPage">
      <div className="loaderPreviewCard">
        <h1>StayGoo Loader</h1>
        <p>Preview del icono animado de carga.</p>
        <HouseLoader size={180} label="Cargando experiencias" />
      </div>
    </main>
  );
}

export default LoaderPreviewPage;
