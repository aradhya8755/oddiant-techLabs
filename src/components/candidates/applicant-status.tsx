"use client"

import type React from "react"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ApplicantStatusProps {
  applicantId: string
  currentStatus: string
  jobId: string
}

export function ApplicantStatus({ applicantId, currentStatus, jobId }: ApplicantStatusProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [comment, setComment] = useState("")
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Shortlisted":
      case "select":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Interview":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Hired":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Rejected":
      case "reject":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "hold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setSelectedStatus(newStatus)
    setShowCommentDialog(true)
  }

  const submitStatusChange = async () => {
    setIsUpdating(true)
    try {
      // Update status
      const statusResponse = await fetch(`/api/employee/candidates/${applicantId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
          jobId,
        }),
      })

      if (!statusResponse.ok) {
        throw new Error("Failed to update applicant status")
      }

      // Add comment if provided
      if (comment.trim()) {
        const commentResponse = await fetch(`/api/employee/candidates/${applicantId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment,
            jobId,
          }),
        })

        if (!commentResponse.ok) {
          throw new Error("Failed to add comment")
        }
      }

      toast.success("Applicant status updated successfully")
      setShowCommentDialog(false)
      setComment("")
    } catch (error) {
      console.error("Error updating applicant status:", error)
      toast.error("Failed to update applicant status")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        className={`px-2 py-1 rounded-md text-sm ${getStatusColor(currentStatus)}`}
      >
        <option value="Applied">Applied</option>
        <option value="hold">Hold</option>
        <option value="select">Select</option>
        <option value="reject">Reject</option>
        <option value="Shortlisted">Shortlisted</option>
        <option value="Interview">Interview</option>
        <option value="Hired">Hired</option>
        <option value="Rejected">Rejected</option>
      </select>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Applicant Status</DialogTitle>
            <DialogDescription>
              You are changing the status to <Badge className={getStatusColor(selectedStatus)}>{selectedStatus}</Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Internal Comment (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Add an internal comment about this status change"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCommentDialog(false)
                setSelectedStatus(currentStatus) // Reset to original status
              }}
            >
              Cancel
            </Button>
            <Button onClick={submitStatusChange} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
