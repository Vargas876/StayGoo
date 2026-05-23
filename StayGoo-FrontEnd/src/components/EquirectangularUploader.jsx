import { useMemo, useRef } from "react";
import { Upload, Trash2, CheckCircle2, AlertTriangle, Loader2, ClipboardPaste, ScanSearch } from "lucide-react";
import { useImageValidation } from "../hooks/useImageValidation";
import "./EquirectangularUploader.css";

function cx(...clases) {
  return clases.filter(Boolean).join(" ");
}

export default function EquirectangularUploader({
  onValidImage,
  strict = false,
  maxFileSize = 10 * 1024 * 1024,
  className = "",
}) {
  const inputRef = useRef(null);

  const {
    validating,
    valid,
    error,
    imageInfo,
    previewUrl,
    progress,
    estado,
    reset,
    onChange,
    onDrop,
    onDragOver,
    onDragLeave,
    validateFile,
  } = useImageValidation({ strict, maxFileSize });

  const instrucciones = useMemo(() => {
    if (estado === "validating") return "Validando imagen 360°...";
    if (estado === "valid") return "Imagen equirectangular válida.";
    if (estado === "invalid") return "La imagen no cumple con los requisitos 360°.";
    return "Arrastra una imagen, haz clic para seleccionar o pégala desde el portapapeles.";
  }, [estado]);

  const emitirValidacion = async (resultado, archivo) => {
    if (resultado?.valid && archivo && onValidImage) {
      onValidImage(archivo, {
        width: resultado.width,
        height: resultado.height,
        ratio: resultado.ratio,
      });
    }
  };

  const manejarSeleccion = async (event) => {
    const archivo = event.target.files?.[0] ?? null;
    const resultado = await onChange(event);
    await emitirValidacion(resultado, archivo);
  };

  const manejarDrop = async (event) => {
    const resultado = await onDrop(event);
    const archivo = event.dataTransfer.files?.[0] ?? null;
    await emitirValidacion(resultado, archivo);
  };

  const manejarPegar = async (event) => {
    const items = Array.from(event.clipboardData?.items ?? []);
    const itemImagen = items.find((item) => item.kind === "file" && item.type.startsWith("image/"));

    if (!itemImagen) return;

    const archivo = itemImagen.getAsFile();
    const resultado = await validateFile(archivo);
    await emitirValidacion(resultado, archivo);
  };

  const manejarReset = () => {
    reset();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const raizClases = cx(
    "eqUploader",
    estado === "dragover" && "isDragover",
    className
  );

  return (
    <section className={raizClases} onPaste={manejarPegar} tabIndex={0}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={manejarSeleccion}
      />

      <div
        className={cx(
          "eqUploaderDropzone",
          estado === "dragover" && "isDragover",
          estado === "validating" && "isValidating",
          estado === "valid" && "isValid",
          estado === "invalid" && "isInvalid0",
          estado === "idle" && "border-slate-200 bg-slate-50"
        )}
        onDrop={manejarDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="eqHeader">
          <div className="eqTitles">
            <h3>Validador 360°</h3>
            <p>{instrucciones}</p>
          </div>

          <div className="eqActions">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="eqBtnPrimary"
            >
              <Upload size={16} />
              Seleccionar
            </button>
            <button
              type="button"
              onClick={manejarReset}
              className="eqBtnSecondary"
            >
              <Trash2 size={16} />
              Limpiar
            </button>
          </div>
        </div>

        <div className="eqBody">
          <div className="eqPreviewCard">
            <div className="eqPreviewHeader">
              <p>Vista previa</p>
              <span>{validating ? "Validando" : estado}</span>
            </div>

            <div className="eqPreviewContent">
              {previewUrl ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <div className="eqPreviewImageWrap">
                    <img src={previewUrl} alt="Vista previa 360" />
                    <div className="eqPreviewBadge">
                      Simulación esférica
                    </div>
                  </div>
                  {valid ? (
                    <div className="eqValidBadge">
                      <CheckCircle2 size={15} />
                      Lista para 360°
                    </div>
                  ) : null}
                </div>
              ) : validating ? (
                <div className="eqLoadingState">
                  <Loader2 size={28} className="eqSpinIcon" />
                  <p>Procesando imagen...</p>
                </div>
              ) : (
                <div className="eqEmptyState">
                  <div className="eqEmptyIcon">
                    <ScanSearch size={24} />
                  </div>
                  <p>La miniatura aparecerá aquí cuando la imagen pase la validación.</p>
                  <small>También puedes pegar una imagen con Ctrl+V.</small>
                </div>
              )}
            </div>
          </div>

          <div className="eqDataCard">
            <div className="eqStatusBox">
              <h4>Estado</h4>
              <div className={cx(
                "eqStatusText",
                estado === "valid" ? "isValid" :
                estado === "invalid" ? "isInvalid" :
                estado === "validating" ? "isValidating" : "isIdle"
              )}>
                {estado === "valid" ? <><CheckCircle2 size={16} /> Válido</> :
                 estado === "invalid" ? <><AlertTriangle size={16} /> Inválido</> :
                 estado === "validating" ? <><Loader2 size={16} className="eqSpinIcon" /> Validando</> :
                 "En espera"}
              </div>
              <div className="eqProgressBarTrack">
                <div className="eqProgressBarFill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="eqInfoGrid">
              <InfoCard titulo="Dimensiones" valor={imageInfo ? `${imageInfo.width} × ${imageInfo.height}` : "—"} />
              <InfoCard titulo="Relación" valor={imageInfo ? imageInfo.ratioTexto : "—"} />
              <InfoCard titulo="Tamaño" valor={imageInfo ? imageInfo.tamanoTexto : "—"} />
              <InfoCard titulo="Formato" valor={imageInfo ? imageInfo.tipo : "—"} />
            </div>

            {imageInfo?.warning ? (
              <div className="eqAlert isWarning">
                {imageInfo.warning}
              </div>
            ) : null}

            {error ? (
              <div className="eqAlert isError">
                {error}
              </div>
            ) : null}

            <div className="eqRequirements">
              <p>Requisitos</p>
              <ul>
                <li>Relación exacta 2:1 con tolerancia del 1%</li>
                <li>Resolución mínima 2048×1024</li>
                <li>Formatos: JPG, PNG o WebP</li>
                <li>{strict ? "Modo strict activado: metadatos 360° obligatorios" : "Modo strict desactivado: solo validación visual"}</li>
              </ul>
            </div>

            <div className="eqClipboardHint">
              <ClipboardPaste size={14} />
              <span>Pega una imagen desde el portapapeles para validarla al instante.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ titulo, valor }) {
  return (
    <div className="eqInfoItem">
      <h5>{titulo}</h5>
      <p>{valor}</p>
    </div>
  );
}
