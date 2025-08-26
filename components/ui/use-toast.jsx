"use client"

import * as React from "react"
import { toast as hotToast } from "react-hot-toast"

export function useToast() {
  return {
    toast: hotToast,
  }
}