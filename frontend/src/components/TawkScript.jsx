import { useEffect } from "react"
import { useLocation } from "react-router-dom"

const TawkScript = () => {
  const location = useLocation()

  useEffect(() => {
    console.log("Current pathname:", location.pathname) // Debug logging

    const currentPath = location.pathname
    const isOnboarding = currentPath.includes("onboarding")

    console.log("Is onboarding path?", isOnboarding) // Debug logging

    if (!isOnboarding) {
      if (!window.Tawk_API) {
        var Tawk_API = Tawk_API || {},
          Tawk_LoadStart = new Date()

        ;(function () {
          var s1 = document.createElement("script"),
            s0 = document.getElementsByTagName("script")[0]
          s1.async = true
          s1.src = "https://embed.tawk.to/67da67e5990994190a520201/1immibmdq"
          s1.charset = "UTF-8"
          s1.setAttribute("crossorigin", "*")
          s0.parentNode.insertBefore(s1, s0)
        })()
      }
    } else {
      // If we're on onboarding page and Tawk is loaded, hide it
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget()
      }
    }
  }, [location.pathname])

  return null // This component doesn't render anything
}

export default TawkScript
