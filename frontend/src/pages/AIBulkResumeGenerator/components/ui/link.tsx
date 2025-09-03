import React from "react"
import { useNavigate } from "react-router-dom"

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, children, href, onClick, ...props }, ref) => {
  const navigate = useNavigate()
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    navigate(href || "#")

    if (onClick) {
      onClick(event)
    }
    // Prevent default behavior if href is not provided
    if (!href) {
      event.preventDefault()
    }
  }
  return (
    <a
      ref={ref}
      className={`${className}`}
      onClick={handleClick}
      href="#"
      {...props}>
      {children}
    </a>
  )
})

Link.displayName = "Link"

export default Link
