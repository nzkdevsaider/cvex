"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Resume } from "@/types/resume";
import { generateLatexForTemplate } from "@/lib/latex/templates";
import type { SectionKey } from "@/lib/latex/types";

interface PdfTeXCompileResult {
  pdf: Uint8Array | undefined;
  status: number;
  log: string;
}

interface PdfTeXEngineInstance {
  loadEngine(): Promise<void>;
  isReady(): boolean;
  writeMemFSFile(filename: string, src: string | Uint8Array): void;
  setEngineMainFile(filename: string): void;
  compileLaTeX(): Promise<PdfTeXCompileResult>;
  flushCache(): void;
  closeWorker(): void;
}

declare global {
  interface Window {
    exports?: {
      PdfTeXEngine?: new () => PdfTeXEngineInstance;
    };
  }
}

const COMPILE_DEBOUNCE_MS = 300;

export function useLatexWorker() {
  const engineRef = useRef<PdfTeXEngineInstance | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const script = document.createElement("script");
    script.src = "/PdfTeXEngine.js";

    script.onload = async () => {
      try {
        const PdfTeXEngine = window.exports?.PdfTeXEngine;
        if (!PdfTeXEngine) {
          throw new Error(
            "PdfTeXEngine no encontrado después de cargar el script.",
          );
        }
        const engine = new PdfTeXEngine();
        await engine.loadEngine();
        engineRef.current = engine;
        setIsInitializing(false);
      } catch (e) {
        setError(
          `Error al inicializar el motor LaTeX: ${e instanceof Error ? e.message : String(e)}`,
        );
        setIsInitializing(false);
      }
    };

    script.onerror = () => {
      setError(
        "No se pudo cargar PdfTeXEngine.js. Comprueba que los archivos de SwiftLaTeX están en /public.",
      );
      setIsInitializing(false);
    };

    document.head.appendChild(script);

    return () => {
      engineRef.current?.closeWorker();
      engineRef.current = null;
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const compile = useCallback(
    (resume: Resume, templateId = "default", sectionOrder?: string[]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        const engine = engineRef.current;
        if (!engine?.isReady()) return;

        const latex = generateLatexForTemplate(
          templateId,
          resume,
          sectionOrder as SectionKey[] | undefined,
        );
        setIsCompiling(true);
        setError(null);

        try {
          engine.writeMemFSFile("main.tex", latex);
          engine.setEngineMainFile("main.tex");
          const result = await engine.compileLaTeX();

          if (result.status !== 0 || !result.pdf) {
            setError(
              `Error de compilación (código ${result.status}).\n\nLog LaTeX:\n${result.log}`,
            );
            return;
          }

          const blob = new Blob(
            [
              result.pdf.buffer.slice(
                result.pdf.byteOffset,
                result.pdf.byteOffset + result.pdf.byteLength,
              ) as ArrayBuffer,
            ],
            { type: "application/pdf" },
          );
          setPdfUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
          setPdfBlob(blob);
          setError(null);
        } catch (e) {
          setError(
            `Error inesperado: ${e instanceof Error ? e.message : String(e)}`,
          );
        } finally {
          setIsCompiling(false);
        }
      }, COMPILE_DEBOUNCE_MS);
    },
    [],
  );

  return { pdfUrl, pdfBlob, isCompiling, isInitializing, error, compile };
}
