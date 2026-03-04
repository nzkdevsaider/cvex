"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useResumeData } from "@/hooks/useResumeData";
import { useLatexWorker } from "@/hooks/useLatexWorker";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ViewPage() {
  const params = useParams<{ fileId: string }>();
  const router = useRouter();
  const fileId = params?.fileId ?? "";

  const { entry, resume, hydrated } = useResumeData(fileId);
  const { pdfUrl, pdfBlob, isCompiling, isInitializing, compile } =
    useLatexWorker();

  const compiled = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!entry) {
      router.replace("/files");
      return;
    }
    // Wait until the LaTeX engine is ready
    if (isInitializing) return;
    if (!compiled.current && resume) {
      compiled.current = true;
      compile(resume, entry.templateId);
    }
  }, [hydrated, entry, resume, router, compile, isInitializing]);

  function handleDownloadPdf() {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entry?.data.basics.name || "cv"}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  function handleExportJson() {
    if (!resume) return;
    const blob = new Blob([JSON.stringify(resume, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entry?.data.basics.name || "cv"}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  if (!hydrated) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-base-300 bg-base-200 px-5 py-3">
        <div className="flex items-center gap-3">
          <Link href="/files">
            <Button variant="ghost" size="sm">
              ← Mis CVs
            </Button>
          </Link>
          <span className="text-sm font-medium opacity-80">
            {entry?.data.basics.name || "Sin nombre"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/edit/${fileId}`}>
            <Button variant="secondary" size="sm">
              Editar
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportJson}
            disabled={!resume}
          >
            Exportar JSON
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={!pdfBlob}
            loading={isCompiling}
          >
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* PDF viewer */}
      <div className="relative flex-1 bg-base-300">
        {/* Engine initialising */}
        {isInitializing && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-base-300/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <span className="loading loading-spinner loading-lg" />
              <p className="text-sm font-medium">Cargando motor LaTeX…</p>
              <p className="text-xs opacity-50 max-w-xs">
                La primera vez descarga los paquetes TeX desde la red
                <br />y puede tardar entre (~30 s – 2 min). No te preocupes,
                después cuando edites se cargará instantaneamente.
              </p>
            </div>
          </div>
        )}

        {!isInitializing && isCompiling && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-base-300/70">
            <div className="flex flex-col items-center gap-3">
              <span className="loading loading-spinner loading-lg" />
              <span className="text-xs opacity-60">Generando PDF…</span>
            </div>
          </div>
        )}

        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="h-full w-full border-0"
            title="Vista del PDF"
          />
        ) : (
          !isInitializing &&
          !isCompiling && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <span className="text-5xl opacity-20">&#128196;</span>
              <p className="text-sm opacity-40">
                La previsualización no está disponible en este momento.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
