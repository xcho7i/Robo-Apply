// src/services/notificationService.ts

export interface NotificationPayload {
  title: string
  message: string
  userIds?: string[]
  metadata?: Record<string, any>
}

export interface SubscriberData {
  userId: string
  oneSignalUserId?: string
}

class NotificationService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || "http://localhost:3001/api"
  }

  private getAuthHeaders() {
    const token = localStorage.getItem("access_token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  }

  async registerSubscriber(data: SubscriberData): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/subscriber`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Failed to register subscriber: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error registering subscriber:", error)
      throw error
    }
  }

  async removeSubscriber(userId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/notifications/subscriber/${userId}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders()
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to remove subscriber: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error removing subscriber:", error)
      throw error
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/send`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error sending notification:", error)
      throw error
    }
  }

  async sendTestNotification(userId: string): Promise<any> {
    return this.sendNotification({
      title: "Test Notification",
      message: "This is a test notification from RoboApply!",
      userIds: [userId],
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    })
  }
}

export const notificationService = new NotificationService()
export default notificationService
