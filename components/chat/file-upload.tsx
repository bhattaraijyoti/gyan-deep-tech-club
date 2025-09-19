"use client"

import type React from "react"

import { useRef } from "react"

interface FileUploadProps {
  children: React.ReactNode
  onUpload: (file: File, type: string) => void
  accept: string
  type: string
}

export function FileUpload({ children, onUpload, accept, type }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file, type)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
    </>
  )
}
