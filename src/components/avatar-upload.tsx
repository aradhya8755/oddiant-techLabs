"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pencil, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AvatarUploadProps {
  initialAvatarUrl?: string
  employeeId: string
  onAvatarUpdate: (url: string) => void
}

export default function AvatarUpload({ initialAvatarUrl, employeeId, onAvatarUpdate }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialAvatarUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [initials, setInitials] = useState("EM")

  useEffect(() => {
    setAvatarUrl(initialAvatarUrl)
  }, [initialAvatarUrl])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, or WebP)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    try {
      setIsUploading(true)

      // Create form data for the upload
      const formData = new FormData()
      formData.append("avatar", file)
      formData.append("employeeId", employeeId)

      // Upload to server
      const response = await fetch("/api/employee/avatar/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to upload avatar")
      }

      const data = await response.json()
      setAvatarUrl(data.avatarUrl)
      onAvatarUpdate(data.avatarUrl)
      toast.success("Profile picture updated successfully")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload profile picture")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-gray-200">
          <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Profile" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-2 -right-2">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <div className="rounded-full bg-primary p-2 text-primary-foreground shadow-sm hover:bg-primary/90">
              <Pencil className="h-4 w-4" />
            </div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Uploading...</span>
        </div>
      )}
    </div>
  )
}
