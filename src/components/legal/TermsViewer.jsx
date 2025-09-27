// src/components/legal/TermsViewer.jsx
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../../styles/pages/PdfLegal.css"; // importa estilos

// Convierte líneas tipo "CONDICIONES GENERALES..." en H1
// y "1. DESCRIPCIÓN" en H2. Resalta "1.1", "1.2" en negrita.
function toPdfLikeMarkdown(src) {
  if (!src) return "";
  let t = src.replace(/\r\n?/g, "\n").trim();

  // compactar espacios largos
  t = t.replace(/[ \t]+/g, " ");

  // 1) TÍTULO (primera línea en mayúsculas)
  //    ej: "CONDICIONES GENERALES DE VENTA EN LÍNEA"
  const lines = t.split("\n");
  const first = lines[0]?.trim() || "";
  if (/^[A-ZÁÉÍÓÚÜÑ0-9\s'’\-]+$/.test(first) && first.length > 8) {
    t = `# ${first}\n\n` + lines.slice(1).join("\n").trimStart();
  }

  // 2) SECCIONES tipo "1. DESCRIPCIÓN", "2. LOS PRODUCTOS..."
  //    Inserta salto y convierte a "## n. TÍTULO"
  //    - No debe estar precedido por dígito (evita cortar dentro de números)
  //    - Debe venir seguido de texto en MAYÚSCULAS (evita confundir con 1.1)
  t = t.replace(
    /(^|[^0-9])(\d+)\.\s([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\s'’().\-\/]+)(?=\s|$)/g,
    (m, pre, n, title) => `${pre}\n\n## ${n}. ${title.trim()}\n`
  );

  // 3) SUBARTÍCULOS "1.1", "4.2.3" → párrafo nuevo + negrita
//    - No precedido por dígito (evita cortar dentro de "0896.755.397")
//    - Debe tener un espacio después
t = t.replace(
  /(^|[^0-9])(\d+\.\d+(?:\.\d+)*)(?=\s)/g,
  (m, pre, num) => `${pre}\n\n**${num}** `
);


  // 4) Bullets "●" → "- "
  t = t.replace(/\n?\s*●\s*/g, "\n- ");

  // 5) Listas "1° 2° ..." → lista ordenada MD
  t = t.replace(/(\n|^)\s*(\d)°\s/g, "\n$2. ");

  // 6) Colapsar saltos múltiples
  t = t.replace(/\n{3,}/g, "\n\n");

  return t.trim();
}


export default function TermsViewer({ language = "es", variant = "pdf", compact = false }) {
  const [raw, setRaw] = useState("");

  useEffect(() => {
    const url = language === "fr" ? "/legal/cgv.fr.md" : "/legal/cgv.es.md";
    fetch(url, { cache: "no-cache" })
      .then(r => (r.ok ? r.text() : "# Error cargando términos"))
      .then(setRaw)
      .catch(() => setRaw("# Error cargando términos"));
  }, [language]);

  const md = variant === "pdf" ? toPdfLikeMarkdown(raw) : raw;

  return (
    <div className={`pdf-legal ${compact ? "compact" : ""}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {md}
      </ReactMarkdown>
    </div>
  );
}
