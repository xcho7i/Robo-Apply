import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import {
  FileText,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react"
import * as mammoth from "mammoth"
import { BASE_URL } from "@/src/api"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

interface DocumentRendererProps {
  url: string
  title: string
  className?: string
}

// --- PDF Viewer Component ---
const RenderPdfViewerComp = ({
  proxyUrl,
  setError,
  setIsLoading,
  setRenderMethod
}: {
  proxyUrl: string
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setRenderMethod: (
    method: "iframe" | "pdf" | "docx" | "download" | "error"
  ) => void
}) => {
  const fileUrl = useMemo(() => proxyUrl, [proxyUrl])
  const fileObj = useMemo(() => ({ url: fileUrl }), [fileUrl])
  const options = useMemo(
    () => ({
      cMapUrl: "/pdfjs-dist/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "/pdfjs-dist/standard_fonts/"
    }),
    []
  )

  const [currentFile, setCurrentFile] = useState(fileUrl)
  const [numPages, setNumPages] = useState(0)
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [measured, setMeasured] = useState(false)
  const [forceFallbackWidth, setForceFallbackWidth] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const measureAttempts = useRef(0)
  const MAX_MEASURE_ATTEMPTS = 10

  // File change
  useEffect(() => {
    if (fileUrl !== currentFile) {
      setCurrentFile(fileUrl)
      setNumPages(0)
      setIsDocumentLoaded(false)
    }
  }, [fileUrl, currentFile])

  // Initial measurement with fallback
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const attempt = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0) {
        const w = Math.floor(rect.width)
        if (w !== containerWidth) setContainerWidth(w)
        setMeasured(true)
        return
      }
      measureAttempts.current += 1
      if (measureAttempts.current < MAX_MEASURE_ATTEMPTS) {
        requestAnimationFrame(attempt)
      } else {
        setContainerWidth(800)
        setForceFallbackWidth(true)
        setMeasured(true)
      }
    }
    attempt()
  }, [])

  // Observe size changes (skip if fallback)
  useEffect(() => {
    if (!measured || forceFallbackWidth) return
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0]?.contentRect.width || 0)
      if (w > 0 && w !== containerWidth) setContainerWidth(w)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [measured, forceFallbackWidth, containerWidth])

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages)
      setIsDocumentLoaded(true)
      setIsLoading(false)
    },
    [setIsLoading]
  )

  const onDocumentLoadError = useCallback(
    (error: Error) => {
      setError("Failed to load PDF")
      setRenderMethod("error")
      setIsLoading(false)
    },
    [setError, setRenderMethod, setIsLoading]
  )

  const readyToRender = measured && containerWidth > 0

  return (
    <div ref={containerRef} className="w-full h-full" style={{ lineHeight: 0 }}>
      <style>
        {`
          .__original-resume-wrapper > div > div > div > div.relative.w-full.h-full {
            overflow-y: auto !important;
          }
        `}
      </style>
      {!readyToRender && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full text-custompurple-400 mb-4"></div>
            <p className="text-sm text-gray-400">
              {measured ? "Preparing PDF viewer..." : "Measuring container..."}
            </p>
          </div>
        </div>
      )}
      {readyToRender && (
        <Document
          key={`pdf-${currentFile}`}
          file={fileObj}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          options={options}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full text-custompurple-400 mb-4"></div>
                <p className="text-sm text-gray-400">Loading PDF...</p>
              </div>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-red-400">Failed to load PDF</p>
              </div>
            </div>
          }>
          {isDocumentLoaded &&
            numPages > 0 &&
            Array.from({ length: numPages }, (_, i) => (
              <Page
                key={`page-${currentFile}-${i + 1}`}
                pageNumber={i + 1}
                width={containerWidth}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className="block mb-2"
              />
            ))}
        </Document>
      )}
    </div>
  )
}

const RenderPdfViewer = React.memo(RenderPdfViewerComp)

const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  url,
  title,
  className = ""
}) => {
  const [renderMethod, setRenderMethod] = useState<
    "iframe" | "pdf" | "docx" | "download" | "error"
  >("iframe")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [docxHtml, setDocxHtml] = useState<string>("")

  const getFileType = (url: string): "pdf" | "docx" | "txt" | "unknown" => {
    const lowercaseUrl = url.toLowerCase()
    if (lowercaseUrl.includes(".pdf")) return "pdf"
    if (lowercaseUrl.includes(".docx") || lowercaseUrl.includes(".doc"))
      return "docx"
    if (lowercaseUrl.includes(".txt")) return "txt"
    return "unknown"
  }

  const fileType = getFileType(url)

  const getProxyUrl = (originalUrl: string): string => {
    if (
      originalUrl.startsWith("http") &&
      !originalUrl.startsWith(window.location.origin)
    ) {
      const isS3Url =
        originalUrl.includes("s3.amazonaws.com") ||
        originalUrl.includes(".s3.") ||
        originalUrl.match(/^https?:\/\/[^\/]+\.s3[.-][^\/]+/)

      if (isS3Url) {
        const encodedUrl = encodeURIComponent(originalUrl)
        return `${BASE_URL}/api/ai-resume-tailor/stream-s3-file?url=${encodedUrl}`
      }
    }
    return originalUrl
  }

  const proxyUrl = getProxyUrl(url)

  useEffect(() => {
    const determineRenderMethod = async () => {
      setIsLoading(true)
      setError(null)

      console.log("🔍 DocumentRenderer determining method for:", {
        url,
        fileType,
        proxyUrl
      })

      try {
        const checkUrl =
          url.startsWith("http") &&
          !url.startsWith(window.location.origin) &&
          (url.includes("s3.amazonaws.com") ||
            url.includes(".s3.") ||
            url.match(/^https?:\/\/[^\/]+\.s3[.-][^\/]+/))
            ? proxyUrl
            : url

        console.log("🔍 Checking URL accessibility:", checkUrl)
        const response = await fetch(checkUrl, { method: "HEAD" })
        console.log("🔍 URL check response:", response.status, response.ok)

        if (!response.ok) {
          throw new Error(`File not accessible: ${response.status}`)
        }

        switch (fileType) {
          case "pdf":
            console.log("🔍 Setting render method to PDF")
            setRenderMethod("pdf")
            break
          case "docx":
            console.log("🔍 Setting render method to DOCX")
            setRenderMethod("docx")
            // Convert DOCX to HTML using mammoth
            try {
              const response = await fetch(checkUrl)
              const arrayBuffer = await response.arrayBuffer()

              // Configure mammoth options for better conversion
              const options = {
                styleMap: [
                  "p[style-name='Title'] => h1:fresh",
                  "p[style-name='Heading 1'] => h1:fresh",
                  "p[style-name='Heading 2'] => h2:fresh",
                  "p[style-name='Heading 3'] => h3:fresh",
                  "p[style-name='Header'] => h1.header:fresh",
                  "r[style-name='Strong'] => strong",
                  "p[style-name='List Paragraph'] => ul > li:fresh",
                  "table => table.mammoth-table"
                ],
                includeDefaultStyleMap: true,
                includeEmbeddedStyleMap: true,
                convertImage: mammoth.images.imgElement(function (image) {
                  return image.read("base64").then(function (imageBuffer) {
                    return {
                      src:
                        "data:" + image.contentType + ";base64," + imageBuffer
                    }
                  })
                })
              }

              const result = await mammoth.convertToHtml(
                { arrayBuffer },
                options
              )
              console.log("🔍 Mammoth conversion successful:", {
                htmlLength: result.value.length,
                messages: result.messages,
                warnings: result.messages.filter((m) => m.type === "warning"),
                errors: result.messages.filter((m) => m.type === "error")
              })

              if (result.messages.length > 0) {
                console.log("🔍 Mammoth conversion messages:", result.messages)
              }

              setDocxHtml(result.value)
            } catch (mammothError) {
              console.error("❌ Mammoth conversion failed:", mammothError)
              setError("Failed to convert DOCX file")
              setRenderMethod("error")
            }
            break
          case "txt":
            console.log("🔍 Setting render method to TXT (iframe)")
            setRenderMethod("iframe")
            break
          default:
            console.log("🔍 Setting render method to download (unknown type)")
            setRenderMethod("download")
        }
      } catch (err) {
        console.error("❌ Error accessing file:", err)
        setError(err instanceof Error ? err.message : "File not accessible")
        setRenderMethod("error")
      } finally {
        setIsLoading(false)
      }
    }

    if (url) {
      determineRenderMethod()
    }
  }, [url, fileType, proxyUrl])

  const handleDownload = () => {
    const link = document.createElement("a")
    const isExternalS3 =
      url.startsWith("http") &&
      !url.startsWith(window.location.origin) &&
      (url.includes("s3.amazonaws.com") ||
        url.includes(".s3.") ||
        url.match(/^https?:\/\/[^\/]+\.s3[.-][^\/]+/))
    link.href = isExternalS3 ? proxyUrl : url
    link.download = title
    link.target = "_blank"
    link.click()
  }

  const renderDocxViewer = () => {
    console.log("🔍 Mammoth DOCX rendering with HTML length:", docxHtml.length)

    return (
      <div className="w-full h-full bg-white rounded-lg overflow-auto">
        <style>{`
          .mammoth-docx-content {
            max-width: none !important;
            width: 100% !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1f2937;
            line-height: 1.6;
          }
          .mammoth-docx-content h1, .mammoth-docx-content h2, .mammoth-docx-content h3, .mammoth-docx-content h4 {
            margin-top: 1.2em;
            margin-bottom: 0.6em;
            font-weight: 600;
            color: #111827;
          }
          .mammoth-docx-content h1 {
            font-size: 1.5em;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.3em;
          }
          .mammoth-docx-content h2 {
            font-size: 1.3em;
            color: #374151;
          }
          .mammoth-docx-content h3 {
            font-size: 1.15em;
            color: #4b5563;
          }
          .mammoth-docx-content p {
            margin-bottom: 0.8em;
            color: #374151;
            text-align: justify;
          }
          .mammoth-docx-content ul, .mammoth-docx-content ol {
            margin-left: 1.5em;
            margin-bottom: 1em;
            color: #374151;
          }
          .mammoth-docx-content li {
            margin-bottom: 0.3em;
          }
          .mammoth-table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
            border: 1px solid #d1d5db;
          }
          .mammoth-table th, .mammoth-table td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
            color: #374151;
          }
          .mammoth-table th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #111827;
          }
          .mammoth-docx-content strong, .mammoth-docx-content b {
            font-weight: 600;
            color: #111827;
          }
          .mammoth-docx-content em, .mammoth-docx-content i {
            font-style: italic;
          }
          .mammoth-docx-content a {
            color: #3b82f6;
            text-decoration: underline;
          }
          .mammoth-docx-content a:hover {
            color: #1d4ed8;
          }
          .mammoth-docx-content img {
            max-width: 100%;
            height: auto;
            margin: 0.5em 0;
          }
          .header {
            text-align: center;
            background-color: #8b5cf6;
            color: white;
            padding: 1em;
            margin: -1.5rem -1.5rem 1.5rem -1.5rem;
            border-radius: 0.5rem 0.5rem 0 0;
          }
        `}</style>
        <div
          className="mammoth-docx-content p-6"
          dangerouslySetInnerHTML={{ __html: docxHtml }}
          style={{
            fontSize: "14px",
            lineHeight: "1.6"
          }}
        />
      </div>
    )
  }

  const renderIframeViewer = () => (
    <div className="w-full h-full">
      <iframe
        src={proxyUrl}
        className="w-full h-full border-0"
        title={title}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          console.error("Iframe failed, switching to download mode")
          setRenderMethod("download")
        }}
      />
    </div>
  )

  const renderDownloadFallback = () => (
    <div className="flex items-center justify-center h-full bg-gray-800 text-center p-6">
      <div>
        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-200 mb-2">
          {fileType.toUpperCase()} Document
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Preview not available. Download to view the document.
        </p>
        <button
          onClick={handleDownload}
          className="inline-flex items-center px-4 py-2 bg-custompurple-600 hover:bg-custompurple-700 text-white rounded-lg transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Download {title}
        </button>
      </div>
    </div>
  )

  const renderError = () => (
    <div className="flex items-center justify-center h-full bg-gray-800 text-center p-6">
      <div>
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-semibold text-red-300 mb-2">
          Document Unavailable
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          {error || "The document could not be loaded or accessed."}
        </p>
        <button
          onClick={handleDownload}
          className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Try Download
        </button>
      </div>
    </div>
  )

  const renderLoading = () => (
    <div className="flex items-center justify-center h-full bg-gray-800">
      <div className="text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full text-custompurple-400 mb-4"></div>
        <p className="text-sm text-gray-400">Loading document...</p>
      </div>
    </div>
  )

  return (
    <div className={`relative ${className}`}>
      {isLoading && renderLoading()}

      {!isLoading && (
        <>
          {renderMethod === "pdf" && (
            <RenderPdfViewer
              proxyUrl={proxyUrl}
              setIsLoading={setIsLoading}
              setError={setError}
              setRenderMethod={setRenderMethod}
            />
          )}
          {renderMethod === "docx" && renderDocxViewer()}
          {renderMethod === "iframe" && renderIframeViewer()}
          {renderMethod === "download" && renderDownloadFallback()}
          {renderMethod === "error" && renderError()}
        </>
      )}

      {!isLoading && renderMethod !== "error" && (
        <button
          onClick={handleDownload}
          className="absolute top-2 right-2 p-2 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white rounded-lg transition-colors backdrop-blur-sm"
          title={`Download ${title}`}>
          <Download className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default DocumentRenderer
