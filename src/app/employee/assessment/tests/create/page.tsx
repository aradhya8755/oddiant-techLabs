"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import { Pencil, Plus, Trash2, ArrowLeft, Save } from "lucide-react"
import { AssessmentLayout } from "@/components/assessment-layout"

export default function CreateTestPage() {
  const router = useRouter()

  const [testDetails, setTestDetails] = useState({
    name: "",
    description: "",
    duration: 120,
    passingScore: 70,
    instructions: "",
    type: "Frontend",
  })

  const [testSettings, setTestSettings] = useState({
    shuffleQuestions: true,
    preventTabSwitching: true,
    allowCalculator: false,
    autoSubmit: true,
  })

  const [sections, setSections] = useState([
    {
      id: "section-1",
      title: "Multiple Choice Questions",
      duration: 30,
      questionType: "Multiple Choice",
      questions: [],
    },
  ])

  const [isSaving, setIsSaving] = useState(false)
  const [showInstructionsEditor, setShowInstructionsEditor] = useState(false)
  const [showAddQuestionForm, setShowAddQuestionForm] = useState<string | null>(null)
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    type: "Multiple Choice",
    options: ["", "", "", ""],
    correctAnswer: "",
    points: 10,
  })

  const handleTestDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setTestDetails((prev) => ({
      ...prev,
      [name]: name === "duration" || name === "passingScore" ? Number.parseInt(value) : value,
    }))
  }

  const handleTestSettingsChange = (setting: string, value: boolean) => {
    setTestSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  const handleSectionChange = (sectionId: string, field: string, value: string | number) => {
    setSections((prev) => prev.map((section) => (section.id === sectionId ? { ...section, [field]: value } : section)))
  }

  const addSection = () => {
    const newSection = {
      id: `section-${sections.length + 1}`,
      title: `Section ${sections.length + 1}`,
      duration: 30,
      questionType: "Multiple Choice",
      questions: [],
    }

    setSections((prev) => [...prev, newSection])
  }

  const removeSection = (sectionId: string) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId))
  }

  const handleEditInstructions = () => {
    setShowInstructionsEditor(true)
  }

  const handleSaveInstructions = () => {
    setShowInstructionsEditor(false)
  }

  const handleAddQuestion = (sectionId: string) => {
    setShowAddQuestionForm(sectionId)
    setNewQuestion({
      text: "",
      type: "Multiple Choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 10,
    })
  }

  const handleQuestionChange = (field: string, value: string | string[]) => {
    setNewQuestion((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleOptionChange = (index: number, value: string) => {
    setNewQuestion((prev) => {
      const newOptions = [...prev.options]
      newOptions[index] = value
      return {
        ...prev,
        options: newOptions,
      }
    })
  }

  const handleSaveQuestion = (sectionId: string) => {
    // Validate question
    if (!newQuestion.text) {
      toast.error("Question text is required")
      return
    }

    if (newQuestion.type === "Multiple Choice" && !newQuestion.correctAnswer) {
      toast.error("Please select a correct answer")
      return
    }

    // Add question to section
    setSections((prev) =>
      prev.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            questions: [
              ...section.questions,
              {
                id: `question-${section.questions.length + 1}`,
                ...newQuestion,
              },
            ],
          }
        }
        return section
      }),
    )

    // Reset form
    setShowAddQuestionForm(null)
    toast.success("Question added successfully")
  }

  const handleSaveTest = async () => {
    try {
      setIsSaving(true)

      // Validate form
      if (!testDetails.name) {
        toast.error("Test name is required")
        setIsSaving(false)
        return
      }

      if (sections.length === 0) {
        toast.error("At least one section is required")
        setIsSaving(false)
        return
      }

      // Check if any section has questions
      const hasQuestions = sections.some((section) => section.questions.length > 0)
      if (!hasQuestions) {
        toast.error("At least one question is required")
        setIsSaving(false)
        return
      }

      // Calculate total duration from sections
      const totalDuration = sections.reduce((sum, section) => sum + section.duration, 0)

      // Prepare test data
      const testData = {
        name: testDetails.name,
        description: testDetails.description,
        duration: totalDuration,
        passingScore: testDetails.passingScore,
        instructions: testDetails.instructions,
        type: testDetails.type,
        settings: testSettings,
        sections: sections,
        status: "Draft", // Default to draft
      }

      // Send to API
      const response = await fetch("/api/assessment/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create test")
      }

      const data = await response.json()

      toast.success("Test created successfully")
      router.push(`/employee/assessment/tests/${data.testId}`)
    } catch (error: any) {
      console.error("Error saving test:", error)
      toast.error(error.message || "Failed to create test")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreviewTest = () => {
    // Validate form first
    if (!testDetails.name) {
      toast.error("Test name is required")
      return
    }

    if (sections.length === 0) {
      toast.error("At least one section is required")
      return
    }

    // Store test data in localStorage for preview
    localStorage.setItem(
      "testPreview",
      JSON.stringify({
        ...testDetails,
        settings: testSettings,
        sections: sections,
      }),
    )

    // Open preview in new tab
    window.open("/employee/assessment/tests/preview", "_blank")
  }

  return (
    <AssessmentLayout>
      <Toaster position="top-center" />

      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="mr-4 flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold">Create Test</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Test Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Test Details</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="test-name" className="block text-sm font-medium text-gray-700">
                  Test Name
                </label>
                <input
                  id="test-name"
                  name="name"
                  placeholder="e.g. Frontend Developer Assessment"
                  value={testDetails.name}
                  onChange={handleTestDetailsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Test Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={testDetails.type}
                  onChange={handleTestDetailsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Full Stack">Full Stack</option>
                  <option value="QA">QA</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Data">Data</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe what this test is for and what skills it will assess"
                  value={testDetails.description}
                  onChange={handleTestDetailsChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Total Duration (minutes)
                  </label>
                  <input
                    id="duration"
                    name="duration"
                    type="number"
                    value={testDetails.duration}
                    onChange={handleTestDetailsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="passing-score" className="block text-sm font-medium text-gray-700">
                    Passing Score (%)
                  </label>
                  <input
                    id="passing-score"
                    name="passingScore"
                    type="number"
                    value={testDetails.passingScore}
                    onChange={handleTestDetailsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                  Test Instructions
                </label>

                {showInstructionsEditor ? (
                  <div className="space-y-2">
                    <textarea
                      id="instructions"
                      name="instructions"
                      value={testDetails.instructions}
                      onChange={handleTestDetailsChange}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <button
                      onClick={handleSaveInstructions}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Save Instructions
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="min-h-[100px] p-3 border border-gray-300 rounded-md bg-gray-50">
                      {testDetails.instructions ? (
                        <p>{testDetails.instructions}</p>
                      ) : (
                        <p className="text-gray-400">
                          No instructions added yet. Click 'Edit Instructions' to add test instructions.
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleEditInstructions}
                      className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Instructions
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Test Sections</h2>
              <button
                onClick={addSection}
                className="flex items-center px-3 py-1 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </button>
            </div>

            <div className="space-y-6">
              {sections.map((section, index) => (
                <div key={section.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium">Section {index + 1}</h3>
                    {sections.length > 1 && (
                      <button
                        onClick={() => removeSection(section.id)}
                        className="flex items-center px-2 py-1 text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor={`section-title-${section.id}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Section Title
                      </label>
                      <input
                        id={`section-title-${section.id}`}
                        value={section.title}
                        onChange={(e) => handleSectionChange(section.id, "title", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor={`section-duration-${section.id}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Duration (minutes)
                        </label>
                        <input
                          id={`section-duration-${section.id}`}
                          type="number"
                          value={section.duration}
                          onChange={(e) => handleSectionChange(section.id, "duration", Number.parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor={`section-type-${section.id}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Question Type
                        </label>
                        <select
                          id={`section-type-${section.id}`}
                          value={section.questionType}
                          onChange={(e) => handleSectionChange(section.id, "questionType", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          <option value="Multiple Choice">Multiple Choice</option>
                          <option value="Written Answer">Written Answer</option>
                          <option value="Coding">Coding</option>
                        </select>
                      </div>
                    </div>

                    {/* Questions List */}
                    {section.questions.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Questions ({section.questions.length})
                        </h4>
                        <div className="space-y-2">
                          {section.questions.map((question, qIndex) => (
                            <div key={question.id} className="p-3 border rounded-md bg-gray-50">
                              <p className="font-medium">
                                {qIndex + 1}. {question.text}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {question.type} • {question.points} points
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Question Form */}
                    {showAddQuestionForm === section.id ? (
                      <div className="mt-4 p-4 border rounded-md bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Question</h4>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Question Text</label>
                            <textarea
                              value={newQuestion.text}
                              onChange={(e) => handleQuestionChange("text", e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="Enter your question here"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Question Type</label>
                            <select
                              value={newQuestion.type}
                              onChange={(e) => handleQuestionChange("type", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            >
                              <option value="Multiple Choice">Multiple Choice</option>
                              <option value="Written Answer">Written Answer</option>
                              <option value="Coding">Coding</option>
                            </select>
                          </div>

                          {newQuestion.type === "Multiple Choice" && (
                            <div className="space-y-3">
                              <label className="block text-sm font-medium text-gray-700">Options</label>
                              {newQuestion.options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={newQuestion.correctAnswer === option}
                                    onChange={() => handleQuestionChange("correctAnswer", option)}
                                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                                  />
                                  <input
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder={`Option ${index + 1}`}
                                  />
                                </div>
                              ))}
                              <p className="text-xs text-gray-500">Select the correct answer</p>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Points</label>
                            <input
                              type="number"
                              value={newQuestion.points}
                              onChange={(e) => handleQuestionChange("points", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>

                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              onClick={() => setShowAddQuestionForm(null)}
                              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveQuestion(section.id)}
                              className="px-3 py-1 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                            >
                              Save Question
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddQuestion(section.id)}
                        className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Settings & Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Test Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="shuffle-questions" className="block text-sm font-medium text-gray-700">
                    Shuffle Questions
                  </label>
                  <p className="text-xs text-gray-500">Randomize question order for each candidate</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="shuffle-questions"
                    checked={testSettings.shuffleQuestions}
                    onChange={(e) => handleTestSettingsChange("shuffleQuestions", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="prevent-tab-switching" className="block text-sm font-medium text-gray-700">
                    Prevent Tab Switching
                  </label>
                  <p className="text-xs text-gray-500">Alert when candidate tries to switch tabs</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="prevent-tab-switching"
                    checked={testSettings.preventTabSwitching}
                    onChange={(e) => handleTestSettingsChange("preventTabSwitching", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="allow-calculator" className="block text-sm font-medium text-gray-700">
                    Allow Calculator
                  </label>
                  <p className="text-xs text-gray-500">Provide a calculator tool for candidates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="allow-calculator"
                    checked={testSettings.allowCalculator}
                    onChange={(e) => handleTestSettingsChange("allowCalculator", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="auto-submit" className="block text-sm font-medium text-gray-700">
                    Auto Submit
                  </label>
                  <p className="text-xs text-gray-500">Submit test when time expires</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="auto-submit"
                    checked={testSettings.autoSubmit}
                    onChange={(e) => handleTestSettingsChange("autoSubmit", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleSaveTest}
                disabled={isSaving}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Test
                  </>
                )}
              </button>

              <button
                onClick={handlePreviewTest}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Preview Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </AssessmentLayout>
  )
}
