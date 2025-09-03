export default function OnboardingLayoutB({ children }: any) {
  return (
    <div className="relative min-h-screen flex md:flex-row flex-col bg-brand-bgBlue md:p-1 p-0">
      {/* Right Section */}
      <div className="relative z-20 flex-1 flex justify-center p-3 sm:p-8 overflow-auto">
        <img
          src="/images/bg-grad.png"
          alt=""
          className="absolute bottom-0  w-full h-full z-0"
        />
        <div className="w-full z-50 pb-16 md:pb-0">{children}</div>
      </div>
    </div>
  )
}
