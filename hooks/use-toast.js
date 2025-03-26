import toast from 'react-hot-toast'

export const useToast = () => {
  return {
    toast: {
      success: (message) => toast.success(message),
      error: (message) => toast.error(message),
      custom: toast,
    }
  }
}
