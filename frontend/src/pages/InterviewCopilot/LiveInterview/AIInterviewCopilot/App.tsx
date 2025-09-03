import { useParams } from 'react-router-dom'
import InterviewDashboard from './components/InterviewDashboard'
import InterviewProvider from './providers/InterviewProvider'

function AIInterviewCopilot() {
  const { sessionId } = useParams();
  return (
    <InterviewProvider>
      <InterviewDashboard sessionId={sessionId || ''} />
    </InterviewProvider>
  )
}

export default AIInterviewCopilot
