import { useEffect, useState } from "react"
import { IoMdClose } from "react-icons/io"

const CLARITY_CONSENT = "clarityConsent"
const DB_NAME = "RoboApply"
const DB_VERSION = 1
const STORE_NAME = "appConfig"

// IndexedDB helper functions
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB not available"))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

const getFromIndexedDB = async (key: string): Promise<any> => {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], "readonly")
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  } catch (error) {
    console.error("Error reading from IndexedDB:", error)
    return undefined
  }
}

const setToIndexedDB = async (key: string, value: any): Promise<void> => {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.put(value, key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  } catch (error) {
    console.error("Error writing to IndexedDB:", error)
    throw error
  }
}

// Types
interface CookieConsentProps {
  consent: boolean | undefined
}

interface ClarityWindow extends Window {
  clarity?: (event: string, config: Record<string, string>) => void
}

declare const window: ClarityWindow

const CookieConsentComponent = ({ consent }: CookieConsentProps) => {
  const [cookieConsent, setCookieConsent] = useState(consent)

  const handleAcceptAll = async () => {
    setCookieConsent(true)
    try {
      await setToIndexedDB(CLARITY_CONSENT, true)
      window.clarity?.("consentv2", {
        ad_storage: "granted",
        analytics_storage: "granted"
      })
    } catch (error) {
      console.error("Error setting Clarity consent:", error)
    }
  }

  const handleRejectAll = async () => {
    setCookieConsent(false)
    try {
      await setToIndexedDB(CLARITY_CONSENT, false)
      window.clarity?.("consentv2", {
        ad_storage: "denied",
        analytics_storage: "denied"
      })
    } catch (error) {
      console.error("Error setting Clarity consent:", error)
    }
  }

  useEffect(() => {
    if (cookieConsent !== undefined) {
      try {
        window.clarity?.("consentv2", {
          ad_storage: cookieConsent ? "granted" : "denied",
          analytics_storage: cookieConsent ? "granted" : "denied"
        })
      } catch (error) {
        console.error("Error setting Clarity consent:", error)
      }
    }
  }, [cookieConsent])

  return (
    <>
      {cookieConsent === undefined && (
        <>
          <style>{`
            #cookie-consent-container {
                pointer-events: none !important;
                background-color: transparent !important; 
            }
            #cookie-consent-container > div {
                pointer-events: all !important;
            }
            body:has( .__custom-preview-modal-open) #cookie-consent-container,
            body:has(.MuiDialog-container) #cookie-consent-container {
              display: none !important;
            }
          `}</style>
          <div
            id="cookie-consent-container"
            className="fixed inset-0 bg-black bg-opacity-30 flex items-end justify-start !z-[99999999999999] p-4">
            <div className="bg-modalPurple !border-0 rounded-lg p-4 max-w-lg w-full shadow-xl relative">
              {/* Header */}
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-primary mb-1">
                  We value your privacy
                </h3>
              </div>

              <div className="mb-4">
                {/* Info Section */}
                <div className="flex items-center mb-3">
                  <div>
                    <p className="text-base text-lightGrey">
                      We use cookies to enhance your browsing experience and
                      analyze site traffic. By clicking "Accept All", you
                      consent to our use of cookies.
                    </p>
                  </div>
                </div>

                {/* Message and Details */}
                {/* <div className="bg-almostBlack/80 rounded-lg p-3 mb-3 border border-customGray">
                <div className="text-xs text-primary mb-2">
                  
                </div>

              </div> */}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleRejectAll}
                  className="px-3 py-1.5 text-base font-medium text-primary bg-almostBlack/80 hover:bg-opacity-80 rounded-lg transition-colors border border-customGray">
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-3 py-1.5 text-base font-medium text-primary bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd rounded-lg transition-all">
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

const ClarityConsent = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [consent, setConsent] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const loadClarityConsent = async () => {
      const storedConsent = await getFromIndexedDB(CLARITY_CONSENT)
      setIsLoaded(true)
      setConsent(storedConsent)
    }
    loadClarityConsent()
  }, [])

  if (!isLoaded) return null
  return <CookieConsentComponent consent={consent} />
}

export default ClarityConsent
