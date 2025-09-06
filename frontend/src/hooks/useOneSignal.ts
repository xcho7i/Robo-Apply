import { useState, useEffect, useCallback } from "react"
import OneSignal from "react-onesignal"

interface NotificationData {
  id: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  data?: any
}

interface UseOneSignalReturn {
  isInitialized: boolean
  isSubscribed: boolean
  userId: string | null
  notifications: NotificationData[]
  unreadCount: number
  subscribeUser: () => Promise<boolean>
  unsubscribeUser: () => Promise<boolean>
  markAsRead: (notificationId: string) => void
  clearNotifications: () => void
  sendTestNotification: () => Promise<void>
}

// Singleton class to manage OneSignal state globally
class OneSignalManager {
  private static instance: OneSignalManager
  private initialized: boolean = false
  private initializing: boolean = false
  private subscribers: Set<(data: any) => void> = new Set()
  private notifications: NotificationData[] = []
  private isSubscribed: boolean = false
  private userId: string | null = null

  private ONESIGNAL_APP_ID = "a854b492-d97b-4fc4-becf-f14de98f1203"
  private BACKEND_URL =
    import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

  static getInstance(): OneSignalManager {
    if (!OneSignalManager.instance) {
      OneSignalManager.instance = new OneSignalManager()
    }
    return OneSignalManager.instance
  }

  subscribe(callback: (data: any) => void) {
    this.subscribers.add(callback)
    // Immediately notify with current state
    callback({
      isInitialized: this.initialized,
      isSubscribed: this.isSubscribed,
      userId: this.userId,
      notifications: this.notifications
    })
  }

  unsubscribe(callback: (data: any) => void) {
    this.subscribers.delete(callback)
  }

  private notifySubscribers() {
    const data = {
      isInitialized: this.initialized,
      isSubscribed: this.isSubscribed,
      userId: this.userId,
      notifications: this.notifications
    }
    this.subscribers.forEach((callback) => callback(data))
  }

  async initialize(): Promise<void> {
    if (this.initialized || this.initializing) {
      return
    }

    try {
      this.initializing = true

      // Check if already initialized globally
      if (window.OneSignal && typeof window.OneSignal.init === "function") {
        // Try to get current state without re-initializing
        try {
          const subscribed = await OneSignal.isPushNotificationsEnabled()
          this.isSubscribed = subscribed
          if (subscribed) {
            this.userId = await OneSignal.getUserId()
          }
          this.setupEventListeners()
          this.initialized = true
          this.notifySubscribers()
          return
        } catch (e) {
          // If getting state fails, continue with initialization
          console.log("OneSignal state check failed, continuing with init...")
        }
      }

      await OneSignal.init({
        appId: this.ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: { enable: false },
        welcomeNotification: { disable: true }
      })

      this.setupEventListeners()
      await this.checkInitialStatus()

      this.initialized = true
      console.log("OneSignal initialized successfully")
    } catch (error) {
      console.error("OneSignal initialization error:", error)
      // Even if init fails, mark as initialized to prevent retry loops
      this.initialized = true
    } finally {
      this.initializing = false
      this.notifySubscribers()
    }
  }

  private setupEventListeners() {
    try {
      OneSignal.on("subscriptionChange", (isSubscribed: boolean) => {
        console.log("OneSignal subscription changed:", isSubscribed)
        this.isSubscribed = isSubscribed

        if (isSubscribed) {
          OneSignal.getUserId()
            .then((id) => {
              if (id) {
                this.userId = id
                this.registerUserWithBackend(id)
              }
            })
            .catch(console.error)
        } else {
          this.userId = null
        }
        this.notifySubscribers()
      })

      OneSignal.on("notificationDisplay", (event: any) => {
        console.log("OneSignal notification displayed:", event)
        this.addNotification({
          id: event.id || Date.now().toString(),
          title: event.heading || "New Notification",
          message: event.content || "",
          timestamp: new Date(),
          read: false,
          data: event.data
        })
      })

      OneSignal.on("notificationClick", (event: any) => {
        console.log("OneSignal notification clicked:", event)
        if (event.id) {
          this.markAsRead(event.id)
        }
      })
    } catch (error) {
      console.error("Error setting up OneSignal event listeners:", error)
    }
  }

  private async checkInitialStatus() {
    try {
      const subscribed = await OneSignal.isPushNotificationsEnabled()
      this.isSubscribed = subscribed

      if (subscribed) {
        const id = await OneSignal.getUserId()
        if (id) {
          this.userId = id
        }
      }
    } catch (error) {
      console.error("Error checking initial OneSignal status:", error)
    }
  }

  private async registerUserWithBackend(oneSignalUserId: string) {
    try {
      const userData = JSON.parse(localStorage.getItem("user_data") || "{}")
      const token = localStorage.getItem("access_token")

      if (!token) {
        console.error("No access token found")
        return
      }

      const externalUserId =
        userData.id || userData.email || `user_${Date.now()}`

      await OneSignal.setExternalUserId(externalUserId)

      const response = await fetch(
        `${this.BACKEND_URL}/notifications/subscriber`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: externalUserId,
            oneSignalUserId: oneSignalUserId
          })
        }
      )

      if (response.ok) {
        console.log("User registered with backend successfully")
      } else {
        console.error("Failed to register with backend:", response.statusText)
      }
    } catch (error) {
      console.error("Error registering with backend:", error)
    }
  }

  async subscribeUser(): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.initialize()
      }

      await OneSignal.showSlidedownPrompt()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const subscribed = await OneSignal.isPushNotificationsEnabled()
      this.isSubscribed = subscribed
      this.notifySubscribers()
      return subscribed
    } catch (error) {
      console.error("Error subscribing user:", error)
      return false
    }
  }

  async unsubscribeUser(): Promise<boolean> {
    try {
      await OneSignal.setSubscription(false)
      this.isSubscribed = false
      this.userId = null
      this.notifySubscribers()
      return true
    } catch (error) {
      console.error("Error unsubscribing user:", error)
      return false
    }
  }

  addNotification(notification: NotificationData) {
    this.notifications = [notification, ...this.notifications.slice(0, 49)]
    this.notifySubscribers()
  }

  markAsRead(notificationId: string) {
    this.notifications = this.notifications.map((notif) =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    )
    this.notifySubscribers()
  }

  clearNotifications() {
    this.notifications = []
    this.notifySubscribers()
  }

  async sendTestNotification(): Promise<void> {
    try {
      const token = localStorage.getItem("access_token")
      const externalUserId = await OneSignal.getExternalUserId()

      if (!token || !externalUserId) {
        throw new Error("Missing authentication or user ID")
      }

      const response = await fetch(`${this.BACKEND_URL}/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: "Test Notification",
          message: "This is a test notification from RoboApply!",
          userIds: [externalUserId],
          metadata: {
            test: true,
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        throw new Error("Failed to send test notification")
      }

      console.log("Test notification sent successfully")
    } catch (error) {
      console.error("Error sending test notification:", error)
      throw error
    }
  }
}

export const useOneSignal = (): UseOneSignalReturn => {
  const [state, setState] = useState({
    isInitialized: false,
    isSubscribed: false,
    userId: null as string | null,
    notifications: [] as NotificationData[]
  })

  const manager = OneSignalManager.getInstance()

  useEffect(() => {
    const handleStateUpdate = (newState: any) => {
      setState(newState)
    }

    manager.subscribe(handleStateUpdate)

    // Initialize if user is logged in
    const token = localStorage.getItem("access_token")
    if (token) {
      manager.initialize()
    }

    return () => {
      manager.unsubscribe(handleStateUpdate)
    }
  }, [manager])

  const subscribeUser = useCallback(() => manager.subscribeUser(), [manager])
  const unsubscribeUser = useCallback(
    () => manager.unsubscribeUser(),
    [manager]
  )
  const markAsRead = useCallback(
    (id: string) => manager.markAsRead(id),
    [manager]
  )
  const clearNotifications = useCallback(
    () => manager.clearNotifications(),
    [manager]
  )
  const sendTestNotification = useCallback(
    () => manager.sendTestNotification(),
    [manager]
  )

  const unreadCount = state.notifications.filter((n) => !n.read).length

  return {
    isInitialized: state.isInitialized,
    isSubscribed: state.isSubscribed,
    userId: state.userId,
    notifications: state.notifications,
    unreadCount,
    subscribeUser,
    unsubscribeUser,
    markAsRead,
    clearNotifications,
    sendTestNotification
  }
}
