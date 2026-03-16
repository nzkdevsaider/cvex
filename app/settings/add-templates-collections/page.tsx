"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { useTemplateCollections } from "@/hooks/useTemplateCollections";
import { Button } from "@/components/ui/Button";
import { Copy } from "lucide-react";

export default function AddTemplatesCollectionsPage() {
  const { collections, syncing, errors, syncUrls, deleteCollection, refresh } =
    useTemplateCollections();

  const [urlsText, setUrlsText] = useState(() => {
    if (typeof window === "undefined") return "";
    return collections.map((c) => c.sourceUrl).join("\n");
  });
  const [saving, setSaving] = useState(false);
  const [lastSaveOk, setLastSaveOk] = useState<boolean | null>(null);
  const [copiedGuide, setCopiedGuide] = useState(false);
  const [guideMarkdown, setGuideMarkdown] = useState<string | null>(null);

  useEffect(() => {
    fetch("/guides/template-collection-guide.md")
      .then((r) => r.text())
      .then(setGuideMarkdown)
      .catch(() => setGuideMarkdown(null));
  }, []);

  function copyGuideForAI() {
    if (!guideMarkdown) return;
    navigator.clipboard.writeText(guideMarkdown).then(() => {
      setCopiedGuide(true);
      setTimeout(() => setCopiedGuide(false), 2000);
    });
  }

  const isSyncingAny = Object.values(syncing).some(Boolean);

  async function handleSaveAndSync() {
    setSaving(true);
    setLastSaveOk(null);

    const urls = urlsText
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      setSaving(false);
      return;
    }

    await syncUrls(urls);
    refresh();
    setSaving(false);
    setLastSaveOk(true);
  }

  const anyError = Object.keys(errors).length > 0;

  const mdComponents: Components = {
    h1: ({ children }) => (
      <h1 className="text-base font-bold mt-4 mb-2">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-sm font-bold mt-5 mb-1 border-b border-base-300 pb-1">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-sm font-semibold mt-3 mb-1">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-sm opacity-80 my-1.5 leading-relaxed">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-5 my-1.5 text-sm opacity-80 space-y-0.5">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 my-1.5 text-sm opacity-80 space-y-0.5">
        {children}
      </ol>
    ),
    li: ({ children }) => <li>{children}</li>,
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    pre: ({ children }) => (
      <pre className="bg-base-300 rounded-lg p-4 text-xs font-mono overflow-x-auto my-2 leading-relaxed">
        {children}
      </pre>
    ),
    code: ({ className, children }) => {
      const isBlock = !!className;
      if (isBlock) return <code className="font-mono text-xs">{children}</code>;
      return (
        <code className="bg-base-300 rounded px-1 py-0.5 text-xs font-mono">
          {children}
        </code>
      );
    },
    table: ({ children }) => (
      <div className="overflow-x-auto my-2">
        <table className="table table-xs w-full">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-base-300">{children}</thead>,
    th: ({ children }) => (
      <th className="text-xs font-semibold py-1.5 pr-4 text-left">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="text-xs font-mono py-1 pr-4 align-top">{children}</td>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="link link-primary"
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    ),
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold">Colecciones de plantillas</h2>
        <div className="flex flex-row gap-2">
          <div className="bg-primary h-6 w-2 rounded-md" />
          <p className="text-md text-accent-content">
            Esta funcionalidad está parcialmente en desarrollo. Podrías
            encontrar errores.
          </p>
        </div>
        <p className="mt-1 text-sm opacity-60">
          Añade las URLs de los repositorios de plantillas que quieras cargar.
          Pon una URL por línea.
        </p>
      </div>

      {/* URL input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="collection-urls">
          URLs de colecciones
        </label>
        <textarea
          id="collection-urls"
          className="textarea textarea-bordered h-36 w-full font-mono text-xs"
          placeholder={
            "https://raw.githubusercontent.com/user/repo/main\nhttps://urlejemplo.com/plantillas"
          }
          value={urlsText}
          onChange={(e) => {
            setUrlsText(e.target.value);
            setLastSaveOk(null);
          }}
          spellCheck={false}
        />
        <p className="text-xs opacity-50">
          Cada URL debe apuntar a la raíz del repositorio o directamente al
          archivo <code>manifest.json</code>.
        </p>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSaveAndSync} disabled={saving || isSyncingAny}>
          {saving || isSyncingAny ? (
            <>
              <span className="loading loading-spinner loading-xs" />
              Sincronizando…
            </>
          ) : (
            "Guardar y sincronizar"
          )}
        </Button>

        {lastSaveOk && !anyError && (
          <span className="text-sm text-success">✓ Sincronizado</span>
        )}
        {lastSaveOk && anyError && (
          <span className="text-sm text-warning">Sincronizado con errores</span>
        )}
      </div>

      {/* Per-URL errors */}
      {anyError && (
        <div className="flex flex-col gap-2">
          {Object.entries(errors).map(([url, msg]) => (
            <div key={url} className="alert alert-error text-sm">
              <span className="font-mono opacity-70 truncate max-w-xs">
                {url}
              </span>
              <span>- {msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Saved collections list */}
      {collections.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold opacity-70">
            Colecciones guardadas
          </h3>
          {collections.map((c) => {
            const isThisSyncing = syncing[c.sourceUrl];
            const syncedAt = new Date(c.lastSyncedAt).toLocaleString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={c.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-base-300 bg-base-200 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{c.name}</span>
                    <span className="badge badge-outline badge-xs">
                      v{c.version}
                    </span>
                    {c.updateAvailable && (
                      <span className="badge badge-warning badge-xs">
                        Actualización disponible
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-50 mt-0.5 truncate">
                    {c.sourceUrl}
                  </p>
                  <p className="text-xs opacity-40 mt-0.5">
                    {c.templates.length} plantilla
                    {c.templates.length !== 1 ? "s" : ""} · Sync: {syncedAt}
                    {c.lastCommitSha && (
                      <>
                        {" "}
                        · <code>{c.lastCommitSha.substring(0, 7)}</code>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isThisSyncing && (
                    <span className="loading loading-spinner loading-xs" />
                  )}
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => {
                      deleteCollection(c.id);
                      setUrlsText((prev) =>
                        prev
                          .split("\n")
                          .filter((l) => l.trim() !== c.sourceUrl)
                          .join("\n"),
                      );
                    }}
                    aria-label={`Eliminar colección ${c.name}`}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {collections.length === 0 && (
        <p className="text-sm opacity-40 text-center py-8">
          Aún no has añadido ninguna colección externa.
        </p>
      )}

      {/* Guide: how to create a collection */}
      <div className="collapse collapse-arrow border border-base-300 bg-base-200 rounded-xl">
        <input type="checkbox" />
        <div className="collapse-title text-sm font-semibold">
          ¿Cómo crear tu propia colección de plantillas?
        </div>
        <div className="collapse-content flex flex-col gap-4">
          {guideMarkdown === null ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <div className="flex flex-col">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={mdComponents}
              >
                {guideMarkdown}
              </ReactMarkdown>
            </div>
          )}

          <div className="pt-2 border-t border-base-300">
            <button
              type="button"
              onClick={copyGuideForAI}
              disabled={!guideMarkdown}
              className="btn btn-sm btn-outline"
              title="Copia la guía en Markdown para pegársela a una IA"
            >
              <Copy />
              {copiedGuide ? "✓ Copiado" : "Copiar guía"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
