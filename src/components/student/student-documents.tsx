"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { FileText, Upload, X, Download, File, FileImage, Music } from "lucide-react"
import { Input } from "@/components/ui/input"

interface DocumentsData {
  resume?: {
    url: string
    filename: string
  }
  videoResume?: {
    url: string
    filename: string
  }
  audioBiodata?: {
    url: string
    filename: string
  }
  photograph?: {
    url: string
    filename: string
  }
}

interface StudentDocumentsProps {
  studentId: string
}

export default function StudentDocuments({ studentId }: StudentDocumentsProps) {
  const [documents, setDocuments] = useState<DocumentsData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`/api/student/documents?studentId=${studentId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch documents")
        }

        const data = await response.json()
        setDocuments(data.documents || {})
      } catch (error) {
        toast.error("Error loading documents")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [studentId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    if (!e.target.files || !e.target.files[0]) return

    const file = e.target.files[0]
    setIsUploading((prev) => ({ ...prev, [documentType]: true }))

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentType", documentType)
      formData.append("studentId", studentId)

      const response = await fetch("/api/student/upload-document", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload document")
      }

      const data = await response.json()

      setDocuments((prev) => ({
        ...prev,
        [documentType]: {
          url: data.url,
          filename: file.name,
        },
      }))

      toast.success("Document uploaded successfully")
    } catch (error) {
      toast.error("Error uploading document")
      console.error(error)
    } finally {
      setIsUploading((prev) => ({ ...prev, [documentType]: false }))
    }
  }

  const handleDeleteDocument = async (documentType: string) => {
    try {
      const response = await fetch("/api/student/delete-document", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          documentType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete document")
      }

      setDocuments((prev) => {
        const updated = { ...prev }
        delete updated[documentType as keyof DocumentsData]
        return updated
      })

      toast.success("Document deleted successfully")
    } catch (error) {
      toast.error("Error deleting document")
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Documents</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Resume
            </CardTitle>
            <CardDescription>Upload your resume in PDF or DOC format</CardDescription>
          </CardHeader>
          <CardContent>
            {documents.resume ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <File className="h-8 w-8 text-blue-500 mr-2" />
                  <div>
                    <p className="font-medium truncate max-w-[200px]">{documents.resume.filename}</p>
                    <a
                      href={documents.resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </a>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDocument("resume")}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, "resume")}
                  className="hidden"
                />
                <label htmlFor="resume-upload">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Click to upload resume</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC or DOCX (max 5MB)</p>
                  </div>
                </label>
                {isUploading.resume && (
                  <div className="mt-2 flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileImage className="h-5 w-5 mr-2" />
              Photograph
            </CardTitle>
            <CardDescription>Upload a professional photograph</CardDescription>
          </CardHeader>
          <CardContent>
            {documents.photograph ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={documents.photograph.url || "/placeholder.svg"}
                    alt="Profile photograph"
                    className="h-16 w-16 object-cover rounded-md mr-2"
                  />
                  <div>
                    <p className="font-medium truncate max-w-[200px]">{documents.photograph.filename}</p>
                    <a
                      href={documents.photograph.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      View full size
                    </a>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDocument("photograph")}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Input
                  id="photograph-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, "photograph")}
                  className="hidden"
                />
                <label htmlFor="photograph-upload">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Click to upload photograph</p>
                    <p className="text-xs text-gray-500 mt-1">JPG or PNG (max 2MB)</p>
                  </div>
                </label>
                {isUploading.photograph && (
                  <div className="mt-2 flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Video Resume
            </CardTitle>
            <CardDescription>Upload a short video introduction</CardDescription>
          </CardHeader>
          <CardContent>
            {documents.videoResume ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center mr-2">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium truncate max-w-[200px]">{documents.videoResume.filename}</p>
                    <a
                      href={documents.videoResume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </a>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDocument("videoResume")}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Input
                  id="video-upload"
                  type="file"
                  accept=".mp4,.mov,.avi"
                  onChange={(e) => handleFileUpload(e, "videoResume")}
                  className="hidden"
                />
                <label htmlFor="video-upload">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Click to upload video resume</p>
                    <p className="text-xs text-gray-500 mt-1">MP4, MOV or AVI (max 50MB)</p>
                  </div>
                </label>
                {isUploading.videoResume && (
                  <div className="mt-2 flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Music className="h-5 w-5 mr-2" />
              Audio Biodata
            </CardTitle>
            <CardDescription>Upload an audio introduction</CardDescription>
          </CardHeader>
          <CardContent>
            {documents.audioBiodata ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center mr-2">
                    <Music className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium truncate max-w-[200px]">{documents.audioBiodata.filename}</p>
                    <a
                      href={documents.audioBiodata.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </a>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDocument("audioBiodata")}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Input
                  id="audio-upload"
                  type="file"
                  accept=".mp3,.wav"
                  onChange={(e) => handleFileUpload(e, "audioBiodata")}
                  className="hidden"
                />
                <label htmlFor="audio-upload">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Click to upload audio biodata</p>
                    <p className="text-xs text-gray-500 mt-1">MP3 or WAV (max 10MB)</p>
                  </div>
                </label>
                {isUploading.audioBiodata && (
                  <div className="mt-2 flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
