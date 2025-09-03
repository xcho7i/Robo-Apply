
import React, { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { fullTourSteps, useTour ,mapStepToChecklist} from "../../stores/tours"
import GradientButton from "../GradientButton"


const STICKY_OFFSET = 100 // sticky header height (px)


function waitForElement(selector: string, timeout = 4000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const start = performance.now()
    const tryFind = () => {
      const el = document.querySelector(selector) as HTMLElement | null
      if (el) return resolve(el)
      if (performance.now() - start > timeout) return resolve(null)
      requestAnimationFrame(tryFind)
    }
    tryFind()
  })
}

// ✅ patched scroll: skip if already visible
function smartScrollTo(el: HTMLElement, mode: "center" | "start" = "center", stickyOffset = STICKY_OFFSET) {
  const vh = window.innerHeight || document.documentElement.clientHeight
  const r = el.getBoundingClientRect()
  const fullyVisible = r.top >= stickyOffset && r.bottom <= vh

  el.style.scrollMarginTop = `${stickyOffset}px`

  if (fullyVisible) return

  el.scrollIntoView({
    behavior: "smooth",
    block: mode === "start" ? "start" : "center",
    inline: "nearest",
  })
}

/* ---------- theme ---------- */
const THEME = {
  purpleDark: "#2B1E5A",
  purple: "#6F62F6",
  gold: "#FFB347",
  text: "#FFFFFF",
  overlay: "rgba(0,0,0,0.78)",
  ring: "#6F62F6",
  border: "rgba(255,255,255,0.10)",
}

/* ---------- spotlight ---------- */
const Spotlight: React.FC<{ rect?: DOMRect | null }> = ({ rect }) => {
  if (!rect) return null
  const style: React.CSSProperties = {
    position: "fixed",
    left: rect.left - 10,
    top: rect.top - 10,
    width: rect.width + 20,
    height: rect.height + 20,
    borderRadius: 12,
    boxShadow: `0 0 0 9999px ${THEME.overlay}`,
    outline: `2px solid ${THEME.ring}`,
    zIndex: 9998,
    pointerEvents: "none",
    // ✅ smoother transition
    transition: "top .3s ease, left .3s ease, width .3s ease, height .3s ease",
    willChange: "top, left, width, height",
  }
  return <div style={style} />
}

/* ---------- welcome ---------- */
const WelcomeModal: React.FC<{ open: boolean; onStart: () => void; onSkip: () => void }> = ({ open, onStart, onSkip }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center">
      <style>{`@keyframes ra-sweep{0%{transform:translateX(-110%)}100%{transform:translateX(310%)}}`}</style>
      <div className="absolute inset-0" style={{ background: THEME.overlay }} />
      <div
        className="relative w-[540px] max-w-[92vw] rounded-[24px] p-6 text-white shadow-2xl"
        style={{ background: THEME.purpleDark, border: `1px solid ${THEME.border}` }}
      >
        <div className="text-[28px] leading-8 font-extrabold tracking-tight text-center">Welcome to RoboApply! 🎉</div>
        <p className="text-center mt-3 opacity-90">Let’s take a quick tour to help you master your job search automation dashboard.</p>
        <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden mt-5">
          <div
            className="absolute inset-y-0 left-0 w-1/3 rounded-full"
            style={{ background: `linear-gradient(90deg, ${THEME.purple} 0%, ${THEME.gold} 100%)`, animation: "ra-sweep 2.2s ease-in-out infinite" }}
          />
        </div>
        <button
          onClick={onStart}
          className="mt-5 w-full py-3 rounded-[16px] font-semibold text-black"
          style={{ background: `linear-gradient(90deg, ${THEME.purple} 0%, ${THEME.gold} 100%)` }}
        >
          Start Guided Tour
        </button>
        <button onClick={onSkip} className="block mx-auto mt-3 text-sm underline opacity-90">— Skip and Explore on My Own</button>
      </div>
    </div>
  )
}

/* ---------- tooltip ---------- */
const POP_WIDTH = 320
const SAFE_GAP = 24
const VIEW_MARGIN = 16

function computePopoverPosition(rect: DOMRect | null, popW: number, popH: number) {
  if (!rect) return { left: VIEW_MARGIN, top: VIEW_MARGIN }
  const vw = window.innerWidth
  const vh = window.innerHeight
  const availRight = vw - rect.right - SAFE_GAP
  const availLeft  = rect.left - SAFE_GAP
  const availBottom= vh - rect.bottom - SAFE_GAP
  const availTop   = rect.top - SAFE_GAP

  let side: "right" | "left" | "bottom" | "top" = "right"
  if (availRight >= popW) side = "right"
  else if (availLeft >= popW) side = "left"
  else if (availBottom >= popH) side = "bottom"
  else if (availTop >= popH) side = "top"
  else {
    [{side:"right",room:availRight},{side:"left",room:availLeft},{side:"bottom",room:availBottom},{side:"top",room:availTop}]
      .sort((a,b)=>b.room-a.room)
      .slice(0,1)
      .forEach((s:any)=> side = s.side as any)
  }

  const centerVert = rect.top  + rect.height / 2 - popH / 2
  const centerHorz = rect.left + rect.width  / 2 - popW / 2
  let left = VIEW_MARGIN, top = VIEW_MARGIN

  if (side === "right") { left = rect.right + SAFE_GAP;  top = Math.max(VIEW_MARGIN, Math.min(vh - popH - VIEW_MARGIN, centerVert)) }
  else if (side === "left") { left = rect.left - popW - SAFE_GAP; top = Math.max(VIEW_MARGIN, Math.min(vh - popH - VIEW_MARGIN, centerVert)) }
  else if (side === "bottom") { top = rect.bottom + SAFE_GAP; left = Math.max(VIEW_MARGIN, Math.min(vw - popW - VIEW_MARGIN, centerHorz)) }
  else { top = rect.top - popH - SAFE_GAP; left = Math.max(VIEW_MARGIN, Math.min(vw - popW - VIEW_MARGIN, centerHorz)) }

  left = Math.max(VIEW_MARGIN, Math.min(vw - popW - VIEW_MARGIN, left))
  top  = Math.max(VIEW_MARGIN, Math.min(vh - popH - VIEW_MARGIN, top))
  return { left, top }
}

/* ---------- tooltip ---------- */
const TooltipCard: React.FC<any> = ({ rect, title, content, step, total, onPrev, onNext, onSkip }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [popH, setPopH] = useState(220)

  useEffect(() => {
    if (!ref.current) return
    setPopH(ref.current.offsetHeight || 220)
  }, [title, content, step, total])

  const { left, top } = computePopoverPosition(rect || null, POP_WIDTH, popH)

  return (
    <div ref={ref} style={{ position: "fixed", left, top, zIndex: 9999, width: POP_WIDTH }} className="rounded-[16px] p-4 text-white">
      <div className="absolute inset-0 -z-10 rounded-[16px]" style={{ background: THEME.purpleDark, border: `1px solid ${THEME.border}`, boxShadow: "0 8px 24px rgba(0,0,0,.45)" }} />
      <div className="text-[14px] font-semibold">{title}</div>
      <div className="text-[12px] opacity-90 mt-1 leading-relaxed">{content}</div>
      <div className="h-1.5 w-full bg-white/10 rounded-full mt-3">
        <div className="h-1.5 rounded-full" style={{ width: `${(step / total) * 100}%`, background: `linear-gradient(90deg, ${THEME.purple} 0%, ${THEME.gold} 100%)` }} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <button onClick={onPrev} className="px-3 py-1.5 rounded-md bg-white/10 text-sm disabled:opacity-40" disabled={step === 1}>← Back</button>
        <div className="flex items-center gap-2">
          <button onClick={onSkip} className="text-xs underline opacity-80">Skip</button>
          <button onClick={onNext} className="px-3 py-1.5 rounded-md text-black text-sm" style={{ background: `linear-gradient(90deg, ${THEME.purple} 0%, ${THEME.gold} 100%)` }}>
            {step === total ? "Finish" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- main ---------- */
const GuidedTourModal: React.FC = () => {
  const { started, welcomeOpen, steps, currentIndex, start, skip, next, prev, setNavigator } = useTour() as any
  const step = steps[currentIndex]
  const nav = useNavigate()
  const location = useLocation()
  const active = started || welcomeOpen

  useEffect(() => { if (typeof setNavigator === "function") setNavigator(nav) }, [nav, setNavigator])
  useEffect(() => { document.body.style.overflow = welcomeOpen ? "hidden" : ""; return () => { document.body.style.overflow = "" } }, [welcomeOpen])

  const stepChangedAtRef = useRef<number>(Date.now())
  useEffect(() => { stepChangedAtRef.current = Date.now() }, [currentIndex])

  useEffect(() => {
    if (!started || !step?.route) return
    if (location.pathname.startsWith(step.route)) return
    const justChanged = Date.now() - stepChangedAtRef.current < 800
    if (!justChanged) return
    nav(step.route)
  }, [started, step?.route, location.pathname, nav, currentIndex])

  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (!started || !step?.target) return
    let cancelled = false
    ;(async () => {
      const el = await waitForElement(step.target, 5000)
      if (!cancelled && el) setTargetEl(el)
    })()
    return () => { cancelled = true }
  }, [started, step?.target, step?.route, location.pathname])

  useEffect(() => {
    if (!started || !step || !targetEl) return
  
    const checklistId = mapStepToChecklist(step.id)
    if (checklistId) {
      const tStore = useTour.getState()
      tStore.markDone(checklistId)
    }
  
    const timeout = setTimeout(() => {
      try {
        step.onEnter?.(targetEl)
      } catch (e) {
        console.error("onEnter failed:", e)
      }
    }, 300)
  
    return () => clearTimeout(timeout)
  }, [started, step, currentIndex, targetEl])
  

  // ✅ rect update with baseline persistence
  const [rect, setRect] = useState<DOMRect | null>(null)
  const lastRectRef = useRef<DOMRect | null>(null)

  useEffect(() => {
    if (!targetEl) return
    let frame: number
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const newRect = targetEl.getBoundingClientRect()
        if (!rect && lastRectRef.current) {
          // reuse old rect first, then animate into new one
          setRect(lastRectRef.current)
          requestAnimationFrame(() => setRect(newRect))
        } else {
          setRect(newRect)
        }
        lastRectRef.current = newRect
      })
    }
    update()

    const ro = new ResizeObserver(update)
    ro.observe(targetEl)
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    window.addEventListener("orientationchange", update)

    return () => {
      ro.disconnect()
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
      window.removeEventListener("orientationchange", update)
      cancelAnimationFrame(frame)
    }
  }, [targetEl, currentIndex])

  // ✅ scroll only forward, not backward
  const lastIndexRef = useRef<number>(-1)
  useEffect(() => {
    if (!started || !targetEl) return
    if (currentIndex < lastIndexRef.current) {
      lastIndexRef.current = currentIndex
      return
    }
    lastIndexRef.current = currentIndex
    if (!targetEl.hasAttribute("tabindex")) targetEl.setAttribute("tabindex", "-1")
    ;(targetEl as HTMLElement).blur()
    const mode = (step?.scroll as "start" | "center") || "center"
    smartScrollTo(targetEl, mode, STICKY_OFFSET)
  }, [started, targetEl, currentIndex, step?.scroll])

  const total = steps.length
  if (!active) return null

  return (
    <>
      <WelcomeModal open={welcomeOpen} onStart={start} onSkip={skip} />
      {started && rect && (
        <>
          <Spotlight rect={rect} />
          <TooltipCard
            rect={rect}
            title={step.title}
            content={step.content}
            step={currentIndex + 1}
            total={total}
            onPrev={prev}
            onNext={next}
            onSkip={skip}
          />
          <div className="fixed top-30 right-6 z-[10000] p-2">
            <GradientButton
              id="reset-tour-btn"
              onClick={() => {
                const t = useTour.getState()
                t.reset()
                t.setSteps(fullTourSteps)
                t.openWelcome()
              }}
            >
              Reset Tour
            </GradientButton>
            </div>
        </>
      )}
    </>
  )
}

export default GuidedTourModal
