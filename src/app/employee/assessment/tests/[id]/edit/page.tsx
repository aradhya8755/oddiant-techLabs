"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast, Toaster } from "sonner"
import { ArrowLeft, Plus, Trash2, Save, Eye, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TestData {
  _id: string
  name: string
  description: string
  duration: number
  passingScore: number
  instructions: string
  type: string
  settings: {
    shuffleQuestions: boolean
    preventTabSwitching: boolean
    allowCalculator: boolean
    autoSubmit: boolean
  }
  sections: SectionData[]
  status: string
  createdAt: string
  updatedAt: string
}

interface SectionData {
  id: string
  title: string
  duration: number
  questionType: string
  questions: QuestionData[]
}

interface QuestionData {
  id: string
  text: string
  type: string
  options?: string[]
  correctAnswer?: string | string[]
  points: number
}

export default function EditTestPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [test, setTest] = useState<TestData | null>(null)
  const [showDeleteSectionDialog, setShowDeleteSectionDialog] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchTest()
  }, [])

  const fetchTest = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/assessment/tests/${testId}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch test")
      }

      const data = await response.json()

      if (data.success) {
        setTest(data.test)
      } else {
        throw new Error(data.message || "Failed to fetch test")
      }
    } catch (error) {
      console.error("Error fetching test:", error)
      toast.error("Failed to load test. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (!test) return

    if (field.startsWith("settings.")) {
      const settingField = field.split(".")[1]
      setTest({
        ...test,
        settings: {
          ...test.settings,
          [settingField]: value,
        },
      })
    } else {
      setTest({
        ...test,
        [field]: value,
      })
    }
  }

  const handleSectionChange = (sectionIndex: number, field: string, value: string | number) => {
    if (!test) return

    const updatedSections = [...test.sections]
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      [field]: value,
    }

    setTest({
      ...test,
      sections: updatedSections,
    })
  }

  const handleAddSection = () => {
    if (!test) return

    const newSection: SectionData = {
      id: `section-${Date.now()}`,
      title: `Section ${test.sections.length + 1}`,
      duration: 15,
      questionType: "Multiple Choice",
      questions: [],
    }

    setTest({
      ...test,
      sections: [...test.sections, newSection],
    })
  }

  const handleDeleteSection = (sectionId: string) => {
    setSectionToDelete(sectionId)
    setShowDeleteSectionDialog(true)
  }

  const confirmDeleteSection = () => {
    if (!test || !sectionToDelete) return

    const updatedSections = test.sections.filter((section) => section.id !== sectionToDelete)

    setTest({
      ...test,
      sections: updatedSections,
    })

    setShowDeleteSectionDialog(false)
    setSectionToDelete(null)
  }

  const handleSaveTest = async () => {
    try {
      if (!test) return

      setIsSaving(true)

      // Validate test data
      if (!test.name) {
        toast.error("Test name is required")
        setIsSaving(false)
        return
      }

      if (test.duration <= 0) {
        toast.error("Test duration must be greater than 0")
        setIsSaving(false)
        return
      }

      if (test.passingScore < 0 || test.passingScore > 100) {
        toast.error("Passing score must be between 0 and 100")
        setIsSaving(false)
        return
      }

      // Validate sections
      for (const section of test.sections) {
        if (!section.title) {
          toast.error("Section title is required")
          setIsSaving(false)
          return
        }

        if (section.duration <= 0) {
          toast.error(`Duration for section "${section.title}" must be greater than 0`)
          setIsSaving(false)
          return
        }
      }

      const response = await fetch(`/api/assessment/tests/${testId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(test),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("Test updated successfully")
        router.push(`/employee/assessment/tests/${testId}`)
      } else {
        throw new Error(data.message || "Failed to update test")
      }
    } catch (error) {
      console.error("Error saving test:", error)
      toast.error((error as Error).message || "Failed to save test. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-9 w-40" />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Test Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <h2 className="text-xl font-medium mb-2">The requested test could not be found</h2>
            <p className="text-muted-foreground mb-6">
              The test may have been deleted or you may not have access to it.
            </p>
            <Button onClick={() => router.push("/employee/assessment/tests")}>Go to Tests</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Toaster position="top-center" />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Test</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/employee/assessment/tests/${testId}/preview`)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSaveTest} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Details</CardTitle>
            <CardDescription>Basic information about the test</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-name">Test Name</Label>
                <Input
                  id="test-name"
                  value={test.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter test name"
                />
              </div>

              <div>
                <Label htmlFor="test-description">Description</Label>
                <Textarea
                  id="test-description"
                  value={test.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter test description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-type">Test Type</Label>
                  <Select value={test.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger id="test-type">
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Assessment">Assessment</SelectItem>
                      <SelectItem value="Quiz">Quiz</SelectItem>
                      <SelectItem value="Exam">Exam</SelectItem>
                      <SelectItem value="Survey">Survey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="test-duration">Total Duration (minutes)</Label>
                  <Input
                    id="test-duration"
                    type="number"
                    min="1"
                    value={test.duration}
                    onChange={(e) => handleInputChange("duration", Number.parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="test-passing-score">Passing Score (%)</Label>
                  <Input
                    id="test-passing-score"
                    type="number"
                    min="0"
                    max="100"
                    value={test.passingScore}
                    onChange={(e) => handleInputChange("passingScore", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="test-instructions">Test Instructions</Label>
                <Textarea
                  id="test-instructions"
                  value={test.instructions}
                  onChange={(e) => handleInputChange("instructions", e.target.value)}
                  placeholder="Enter instructions for test takers"
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Settings</CardTitle>
            <CardDescription>Configure how the test behaves</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Shuffle Questions</h3>
                  <p className="text-sm text-muted-foreground">Randomize question order for each candidate</p>
                </div>
                <Switch
                  checked={test.settings.shuffleQuestions}
                  onCheckedChange={(checked) => handleInputChange("settings.shuffleQuestions", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Prevent Tab Switching</h3>
                  <p className="text-sm text-muted-foreground">Alert when candidate tries to switch tabs</p>
                </div>
                <Switch
                  checked={test.settings.preventTabSwitching}
                  onCheckedChange={(checked) => handleInputChange("settings.preventTabSwitching", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Allow Calculator</h3>
                  <p className="text-sm text-muted-foreground">Provide calculator tool for candidates</p>
                </div>
                <Switch
                  checked={test.settings.allowCalculator}
                  onCheckedChange={(checked) => handleInputChange("settings.allowCalculator", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Auto Submit</h3>
                  <p className="text-sm text-muted-foreground">Submit test when time expires</p>
                </div>
                <Switch
                  checked={test.settings.autoSubmit}
                  onCheckedChange={(checked) => handleInputChange("settings.autoSubmit", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Test Sections</CardTitle>
              <CardDescription>Organize your test into sections</CardDescription>
            </div>
            <Button onClick={handleAddSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {test.sections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No sections added yet. Add a section to get started.</p>
                  <Button onClick={handleAddSection}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              ) : (
                test.sections.map((section, index) => (
                  <div key={section.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Section {index + 1}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`section-title-${index}`}>Section Title</Label>
                        <Input
                          id={`section-title-${index}`}
                          value={section.title}
                          onChange={(e) => handleSectionChange(index, "title", e.target.value)}
                          placeholder="Enter section title"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`section-duration-${index}`}>Duration (minutes)</Label>
                          <Input
                            id={`section-duration-${index}`}
                            type="number"
                            min="1"
                            value={section.duration}
                            onChange={(e) =>
                              handleSectionChange(index, "duration", Number.parseInt(e.target.value) || 0)
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor={`section-type-${index}`}>Question Type</Label>
                          <Select
                            value={section.questionType}
                            onValueChange={(value) => handleSectionChange(index, "questionType", value)}
                          >
                            <SelectTrigger id={`section-type-${index}`}>
                              <SelectValue placeholder="Select question type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                              <SelectItem value="Written Answer">Written Answer</SelectItem>
                              <SelectItem value="Coding">Coding</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium">Questions: </span>
                          <span className="text-sm text-muted-foreground">
                            {section.questions.length} questions in this section
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/employee/assessment/tests/${testId}/sections/${section.id}/edit`)
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Questions
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSaveTest} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Delete Section Dialog */}
      <Dialog open={showDeleteSectionDialog} onOpenChange={setShowDeleteSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section? This will also delete all questions in this section. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteSectionDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSection}>
              Delete Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
