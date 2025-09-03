import { addFeedback } from "@/src/api/functions"
import GradientButton from "@/src/components/GradientButton"
import Heading from "@/src/components/Heading"
import { errorToast, successToast } from "@/src/components/Toast"
import { Rating, Star } from "@smastrom/react-rating"
import { Alert, Input } from "antd"
import { useRef, useState } from "react"
import { AiOutlineLoading } from "react-icons/ai"

function Feedback() {
  const [feedback, setFeedback] = useState({
    rating: 5,
    feedback: ""
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const divHieght = useRef<HTMLDivElement>(null)

  function submitFeedback() {
    if (!feedback.feedback.trim())
      return errorToast("Please provide feedback before submitting.")

    setLoading(true)
    addFeedback(feedback.rating, feedback.feedback)
      .then((res) => {
        if (res.success) setSubmitted(true)
        else errorToast(res.message)
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => setLoading(false))
  }

  if (submitted)
    return (
      <ThankForFeedback height={divHieght?.current?.offsetHeight as number} />
    )

  return (
    <div ref={divHieght} className="flex-1 flex flex-col gap-5">
      <Heading className="flex items-center gap-1" type="h1">
        Share Feedback <span className="text-sm">(optional)</span>
      </Heading>

      <Rating
        items={5}
        itemStyles={{
          itemShapes: Star,
          activeFillColor: "#ffb700",
          inactiveFillColor: "#ccc"
        }}
        className="max-w-[250px]"
        value={feedback.rating}
        onChange={(value: number) =>
          setFeedback({ ...feedback, rating: value })
        }
      />

      <div className="flex flex-col gap-1">
        <label className="text-base font-semibold" htmlFor="feedback">
          Message
        </label>
        <Input.TextArea
          id="feedback"
          value={feedback.feedback}
          onChange={(e) =>
            setFeedback({ ...feedback, feedback: e.target.value })
          }
          rows={4}
          placeholder="Write your feedback here"
        />
      </div>
      <div className="flex justify-end">
        <GradientButton
          icon={
            loading && <AiOutlineLoading className="animate-spin" size={20} />
          }
          disabled={loading}
          onClick={submitFeedback}>
          Submit Feedback
        </GradientButton>
      </div>
    </div>
  )
}
export default Feedback

function ThankForFeedback({ height }: { height: number }) {
  return (
    <div
      style={{ height: height }}
      className="flex-1 flex flex-col items-center justify-center gap-5">
      <Alert
        className="bg-purple"
        message={
          <Heading className="text-center" type="h1">
            Got your feedback!
          </Heading>
        }
        description={
          <p className="text-center textsm font-semibold">
            Thanks! We're always working to improve based on what you share.
          </p>
        }
        type="success"
      />
    </div>
  )
}
