const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const EXTENSIONES_PERMITIDAS = ["jpg", "jpeg", "png", "webp"];
const RESOLUCION_MINIMA = { ancho: 2048, alto: 1024 };
const RESOLUCION_RECOMENDADA = { ancho: 8192, alto: 4096 };
const RELACION_OBJETIVO = 2;
const TOLERANCIA_RELACION = 0.01;

function formatearMB(bytes) {
  if (!Number.isFinite(bytes)) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 1024 * 1024 ? 2 : 1)} MB`;
}

function obtenerExtension(nombre = "") {
  const partes = nombre.toLowerCase().split(".");
  return partes.length > 1 ? partes.pop() : "";
}

function esImagenPermitida(file) {
  const tipoValido = TIPOS_PERMITIDOS.includes(file.type);
  const extensionValida = EXTENSIONES_PERMITIDAS.includes(obtenerExtension(file.name));
  return tipoValido || extensionValida;
}

function leerDimensionesImagen(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const imagen = new Image();

    imagen.onload = () => {
      const ancho = imagen.naturalWidth;
      const alto = imagen.naturalHeight;
      URL.revokeObjectURL(url);
      resolve({ width: ancho, height: alto });
    };

    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };

    imagen.src = url;
  });
}

async function leerMetadatos360(file) {
  const modulo = await import("exifr");
  const datos = await modulo.parse(file, {
    exif: true,
    xmp: true,
    tiff: true,
    ifd0: true,
    reviveValues: false,
    translateValues: false,
  });

  return datos || {};
}

function obtenerValorMetadato(datos, claves) {
  for (const clave of claves) {
    if (datos && datos[clave] !== undefined && datos[clave] !== null) {
      return datos[clave];
    }
  }

  return undefined;
}

function normalizarTexto(valor) {
  return String(valor ?? "").trim().toLowerCase();
}

function formatearRatio(ratio) {
  if (!Number.isFinite(ratio)) return "0.00:1";
  return `${ratio.toFixed(2)}:1`;
}

export async function validateEquirectangularImage(file, options = {}) {
  const { strict = false, maxFileSize = Infinity } = options;

  if (!(file instanceof File)) {
    return { valid: false, error: "No se recibió ningún archivo válido." };
  }

  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: `El archivo supera el tamaño máximo permitido (${formatearMB(maxFileSize)}).`,
    };
  }

  if (!esImagenPermitida(file)) {
    return {
      valid: false,
      error: "El archivo debe ser una imagen JPG, PNG o WebP.",
    };
  }

  let dimensiones;

  try {
    dimensiones = await leerDimensionesImagen(file);
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "No se pudo leer la imagen.",
    };
  }

  const { width, height } = dimensiones;

  if (!width || !height) {
    return {
      valid: false,
      error: "La imagen está corrupta o no tiene dimensiones válidas.",
    };
  }

  const ratio = width / height;
  const diferenciaRatio = Math.abs(ratio - RELACION_OBJETIVO);

  if (diferenciaRatio > TOLERANCIA_RELACION) {
    return {
      valid: false,
      error: `La relación de aspecto debe ser 2:1. La imagen actual es ${formatearRatio(ratio)} (${width}×${height}).`,
      width,
      height,
      ratio,
    };
  }

  if (width < RESOLUCION_MINIMA.ancho || height < RESOLUCION_MINIMA.alto) {
    return {
      valid: false,
      error: `La resolución es muy baja. Se requieren al menos ${RESOLUCION_MINIMA.ancho}×${RESOLUCION_MINIMA.alto}.`,
      width,
      height,
      ratio,
    };
  }

  if (strict) {
    let metadatos;

    try {
      metadatos = await leerMetadatos360(file);
    } catch (error) {
      return {
        valid: false,
        error: "No se pudieron leer los metadatos 360° de la imagen.",
        width,
        height,
        ratio,
      };
    }

    const projectionType = normalizarTexto(
      obtenerValorMetadato(metadatos, ["ProjectionType", "GPano:ProjectionType", "projectionType"])
    );
    const usePanoramaViewer = normalizarTexto(
      obtenerValorMetadato(metadatos, ["UsePanoramaViewer", "GPano:UsePanoramaViewer", "usePanoramaViewer"])
    );
    const fullPanoWidthPixels = Number(
      obtenerValorMetadato(metadatos, ["FullPanoWidthPixels", "GPano:FullPanoWidthPixels", "fullPanoWidthPixels"])
    );
    const croppedAreaLeftPixels = Number(
      obtenerValorMetadato(metadatos, ["CroppedAreaLeftPixels", "GPano:CroppedAreaLeftPixels", "croppedAreaLeftPixels"])
    );

    const metadatos360Validos =
      projectionType === "equirectangular" &&
      usePanoramaViewer === "true" &&
      Number.isFinite(fullPanoWidthPixels) &&
      fullPanoWidthPixels > 0 &&
      Number.isFinite(croppedAreaLeftPixels) &&
      croppedAreaLeftPixels === 0;

    if (!metadatos360Validos) {
      return {
        valid: false,
        error:
          "No se encontraron metadatos 360° válidos. Se requiere ProjectionType=equirectangular, UsePanoramaViewer=True, FullPanoWidthPixels > 0 y CroppedAreaLeftPixels = 0.",
        width,
        height,
        ratio,
      };
    }
  }

  const advertencia =
    width > RESOLUCION_RECOMENDADA.ancho || height > RESOLUCION_RECOMENDADA.alto
      ? `La imagen supera la resolución recomendada de ${RESOLUCION_RECOMENDADA.ancho}×${RESOLUCION_RECOMENDADA.alto}.`
      : null;

  return {
    valid: true,
    width,
    height,
    ratio,
    warning: advertencia,
  };
}
