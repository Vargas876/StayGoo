import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { validateEquirectangularImage } from "../utils/validateEquirectangular";

function crearInfoImagen(file, resultado) {
  const ancho = resultado?.width ?? 0;
  const alto = resultado?.height ?? 0;
  const ratio = resultado?.ratio ?? (alto > 0 ? ancho / alto : 0);

  return {
    nombre: file.name || "Imagen sin nombre",
    tipo: file.type || "Desconocido",
    tamano: file.size,
    tamanoTexto: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    width: ancho,
    height: alto,
    ratio,
    ratioTexto: `${ratio.toFixed(2)}:1`,
    warning: resultado?.warning ?? null,
  };
}

export function useImageValidation({ strict = false, maxFileSize = Infinity } = {}) {
  const [validating, setValidating] = useState(false);
  const [valid, setValid] = useState(null);
  const [error, setError] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const previewUrlRef = useRef(null);
  const resetTimerRef = useRef(null);

  const limpiarPreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }, []);

  const reset = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    limpiarPreview();
    setValidating(false);
    setValid(null);
    setError(null);
    setImageInfo(null);
    setDragOver(false);
    setProgress(0);
  }, [limpiarPreview]);

  useEffect(() => {
    return () => {
      limpiarPreview();
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, [limpiarPreview]);

  const validarArchivo = useCallback(
    async (file) => {
      if (!(file instanceof File)) {
        setValid(false);
        setError("No se recibió ningún archivo válido.");
        setImageInfo(null);
        return { valid: false, error: "No se recibió ningún archivo válido." };
      }

      setValidating(true);
      setValid(null);
      setError(null);
      setImageInfo(null);
      setProgress(15);

      try {
        const resultado = await validateEquirectangularImage(file, { strict, maxFileSize });
        setProgress(70);

        if (!resultado.valid) {
          limpiarPreview();
          setValid(false);
          setError(resultado.error || "La imagen no pasó la validación.");
          setImageInfo(crearInfoImagen(file, resultado));
          return resultado;
        }

        limpiarPreview();
        const url = URL.createObjectURL(file);
        previewUrlRef.current = url;
        setPreviewUrl(url);
        setValid(true);
        setError(null);
        setImageInfo(crearInfoImagen(file, resultado));

        return resultado;
      } catch (error) {
        limpiarPreview();
        setValid(false);
        setError(error instanceof Error ? error.message : "Error inesperado al validar la imagen.");
        setImageInfo(null);
        return { valid: false, error: error instanceof Error ? error.message : "Error inesperado al validar la imagen." };
      } finally {
        setProgress(100);
        setValidating(false);

        if (resetTimerRef.current) {
          clearTimeout(resetTimerRef.current);
        }

        resetTimerRef.current = setTimeout(() => {
          setProgress(0);
        }, 500);
      }
    },
    [limpiarPreview, maxFileSize, strict]
  );

  const procesarListaArchivos = useCallback(
    async (files) => {
      const archivo = files && files.length > 0 ? files[0] : null;
      return validarArchivo(archivo);
    },
    [validarArchivo]
  );

  const onChange = useCallback(
    async (event) => {
      const archivo = event.target.files?.[0] ?? null;
      const resultado = await validarArchivo(archivo);
      event.target.value = "";
      return resultado;
    },
    [validarArchivo]
  );

  const onDrop = useCallback(
    async (event) => {
      event.preventDefault();
      setDragOver(false);
      return procesarListaArchivos(event.dataTransfer.files);
    },
    [procesarListaArchivos]
  );

  const onDragOver = useCallback(
    (event) => {
      event.preventDefault();
      if (!dragOver) setDragOver(true);
    },
    [dragOver]
  );

  const onDragLeave = useCallback((event) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const onPaste = useCallback(
    async (event) => {
      const items = Array.from(event.clipboardData?.items ?? []);
      const itemImagen = items.find((item) => item.kind === "file" && item.type.startsWith("image/"));

      if (!itemImagen) return null;

      const archivo = itemImagen.getAsFile();
      return validarArchivo(archivo);
    },
    [validarArchivo]
  );

  const estado = useMemo(() => {
    if (validating) return "validating";
    if (dragOver) return "dragover";
    if (valid === true) return "valid";
    if (valid === false) return "invalid";
    return "idle";
  }, [dragOver, valid, validating]);

  return {
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
    onPaste,
    validateFile: validarArchivo,
  };
}
