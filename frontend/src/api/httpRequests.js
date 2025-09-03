import api from "."

const getRequest = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params })
    return response.data
  } catch (error) {
    throw error
  }
}

const postRequest = async (url, data) => {
  try {
    const response = await api.post(url, data)
    return response.data
  } catch (error) {
    throw error
  }
}

const putRequest = async (url, data) => {
  try {
    const response = await api.put(url, data)
    return response.data
  } catch (error) {
    throw error
  }
}

const patchRequest = async (url, data) => {
  try {
    const response = await api.patch(url, data)
    return response.data
  } catch (error) {
    throw error
  }
}

const deleteRequest = async (url) => {
  try {
    const response = await api.delete(url)
    return response.data
  } catch (error) {
    throw error
  }
}

export { getRequest, postRequest, putRequest, deleteRequest, patchRequest }
