// Toast is handled globally in App.jsx via react-hot-toast
// This file exports helpers for consistent toast usage

import toast from 'react-hot-toast'

export function showSuccess(message) {
  toast.success(message)
}

export function showError(message) {
  toast.error(message)
}

export function showInfo(message) {
  toast(message, {
    icon: 'ℹ️',
  })
}
