export class Util {
  async fetchData(url: string, options?: RequestInit) {
    const token = localStorage.getItem("access_token")
    if (!token) throw new Error("Access token missing.")

    if (options) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    } else {
      options = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }

    return fetch(url, options)
  }

  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
