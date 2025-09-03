type HeadingProps = {
  type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  children: React.ReactNode
  className?: string
}

function Heading({ type, children, className }: HeadingProps) {
  if (type == "h1") {
    return <h1 className={`text-2xl font-semibold ${className}`}>{children}</h1>
  }
  if (type == "h2") {
    return <h2 className={`text-lg font-bold ${className}`}>{children}</h2>
  }
  if (type == "h3") {
    return (
      <h3 className={`text-base font-semibold ${className}`}>{children}</h3>
    )
  }
  if (type == "h4") {
    return <h4 className={`${className}`}>{children}</h4>
  }
  if (type == "h5") {
    return <h5 className={`${className}`}>{children}</h5>
  }
  if (type == "h6") {
    return <h6 className={`${className}`}>{children}</h6>
  }
}
export default Heading
