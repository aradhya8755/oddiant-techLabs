"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast, Toaster } from "sonner"
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Calculator, X, Upload, Camera, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

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

export default function TestPreviewPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [test, setTest] = useState<TestData | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [activeTab, setActiveTab] = useState("instructions")
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorValue, setCalculatorValue] = useState("0")
  const [calculatorMemory, setCalculatorMemory] = useState<number | null>(null)
  const [calculatorOperation, setCalculatorOperation] = useState<string | null>(null)
  const [calculatorClearNext, setCalculatorClearNext] = useState(false)
  const [showSystemCheck, setShowSystemCheck] = useState(false)
  const [showIdVerification, setShowIdVerification] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [systemChecks, setSystemChecks] = useState({
    cameraAccess: false,
    fullscreenMode: false,
    compatibleBrowser: true,
    tabFocus: true,
  })
  const [idCardImage, setIdCardImage] = useState<string | null>(null)
  const [faceImage, setFaceImage] = useState<string | null>(null)
  const [studentId, setStudentId] = useState("")
  const [acceptedRules, setAcceptedRules] = useState(false)
  const [showTabWarning, setShowTabWarning] = useState(false)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    fetchTest()
    return () => {
      // Stop camera if active
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (test) {
      // Initialize timer
      setTimeLeft(test.duration * 60)

      // Initialize answers
      const initialAnswers: Record<string, string | string[]> = {}
      test.sections.forEach((section) => {
        section.questions.forEach((question) => {
          initialAnswers[question.id] = question.type === "Multiple Choice" ? "" : []
        })
      })
      setAnswers(initialAnswers)
    }
  }, [test])

  useEffect(() => {
    if (timeLeft > 0 && activeTab === "test") {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [timeLeft, activeTab])

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
        // If shuffle questions is enabled, shuffle the questions in each section
        if (data.test.settings.shuffleQuestions) {
          data.test.sections = data.test.sections.map((section: SectionData) => ({
            ...section,
            questions: shuffleArray([...section.questions]),
          }))
        }

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

  const startWebcam = async () => {
    try {
      if (!videoRef.current) return

      // Stop any existing stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: "user",
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        mediaStreamRef.current = stream

        // Ensure video plays
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch((err) => {
              console.error("Error playing video:", err)
              toast.error("Failed to start webcam. Please check your camera permissions.")
            })
          }
        }

        setSystemChecks((prev) => ({
          ...prev,
          cameraAccess: true,
        }))
      }
    } catch (error) {
      console.error("Error starting webcam:", error)
      toast.error("Failed to access webcam. Please ensure camera permissions are granted.")
      setSystemChecks((prev) => ({
        ...prev,
        cameraAccess: false,
      }))
    }
  }

  const enableFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
        setSystemChecks((prev) => ({
          ...prev,
          fullscreenMode: true,
        }))
      }
    } catch (error) {
      console.error("Fullscreen error:", error)
      toast.error("Failed to enable fullscreen mode")
    }
  }

  const handleStartTest = () => {
    setActiveTab("test")
  }

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNextQuestion = () => {
    const currentSectionQuestions = test?.sections[currentSection].questions || []
    if (currentQuestion < currentSectionQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else if (currentSection < (test?.sections.length || 0) - 1) {
      setCurrentSection(currentSection + 1)
      setCurrentQuestion(0)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      setCurrentQuestion((test?.sections[currentSection - 1].questions.length || 1) - 1)
    }
  }

  const handleSubmitTest = () => {
    toast.success("Test submitted successfully (Preview Mode)")
    router.push(`/employee/assessment/tests/${testId}`)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  const calculateProgress = () => {
    if (!test) return 0
    let totalQuestions = 0
    let answeredQuestions = 0

    test.sections.forEach((section) => {
      totalQuestions += section.questions.length
      section.questions.forEach((question) => {
        if (
          answers[question.id] &&
          (typeof answers[question.id] === "string"
            ? answers[question.id] !== ""
            : (answers[question.id] as string[]).length > 0)
        ) {
          answeredQuestions++
        }
      })
    })

    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
  }

  // Scientific Calculator functions
  const handleCalculatorInput = (value: string) => {
    if (calculatorClearNext) {
      setCalculatorValue(value)
      setCalculatorClearNext(false)
      return
    }

    if (calculatorValue === "0") {
      setCalculatorValue(value)
    } else {
      setCalculatorValue(calculatorValue + value)
    }
  }

  const handleCalculatorOperation = (operation: string) => {
    setCalculatorMemory(Number.parseFloat(calculatorValue))
    setCalculatorOperation(operation)
    setCalculatorClearNext(true)
  }

  const handleCalculatorEquals = () => {
    if (calculatorOperation && calculatorMemory !== null) {
      const currentValue = Number.parseFloat(calculatorValue)
      let result = 0

      switch (calculatorOperation) {
        case "+":
          result = calculatorMemory + currentValue
          break
        case "-":
          result = calculatorMemory - currentValue
          break
        case "*":
          result = calculatorMemory * currentValue
          break
        case "/":
          result = calculatorMemory / currentValue
          break
        case "^":
          result = Math.pow(calculatorMemory, currentValue)
          break
      }

      setCalculatorValue(result.toString())
      setCalculatorMemory(null)
      setCalculatorOperation(null)
      setCalculatorClearNext(true)
    }
  }

  const handleCalculatorClear = () => {
    setCalculatorValue("0")
    setCalculatorMemory(null)
    setCalculatorOperation(null)
  }

  // Helper function to shuffle array (Fisher-Yates algorithm)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Toaster position="top-center" />
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Skeleton className="h-9 w-40" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-32 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="container mx-auto py-6">
        <Toaster position="top-center" />
        <div className="max-w-3xl mx-auto">
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
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Test Preview: {test.name}</h1>
        </div>

        <div className="mb-6 flex gap-2">
          <Button variant="outline" onClick={() => setShowSystemCheck(true)}>
            Preview System Check
          </Button>
          <Button variant="outline" onClick={() => setShowIdVerification(true)}>
            Preview ID Verification
          </Button>
          <Button variant="outline" onClick={() => setShowRules(true)}>
            Preview Exam Rules
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions">
            <Card>
              <CardHeader>
                <CardTitle>{test.name}</CardTitle>
                <CardDescription>{test.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Test Instructions</h3>
                  <div className="p-4 border rounded-md bg-muted">
                    {test.instructions ? (
                      <p>{test.instructions}</p>
                    ) : (
                      <p className="text-muted-foreground">No instructions provided for this test.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-md">
                    <h4 className="font-medium mb-1">Duration</h4>
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {test.duration} minutes
                    </p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <h4 className="font-medium mb-1">Passing Score</h4>
                    <p className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                      {test.passingScore}%
                    </p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <h4 className="font-medium mb-1">Sections</h4>
                    <p className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                      {test.sections.length} sections
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Important Notes</h3>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Once you start the test, the timer will begin and cannot be paused.</li>
                    <li>Answer all questions to the best of your ability.</li>
                    <li>Your webcam will remain active during the test for proctoring purposes.</li>
                    {test.settings.preventTabSwitching && (
                      <li>Switching tabs or leaving the test page is not allowed and will be recorded.</li>
                    )}
                    {test.settings.autoSubmit && (
                      <li>The test will be automatically submitted when the time expires.</li>
                    )}
                    {test.settings.shuffleQuestions && <li>Questions are presented in random order.</li>}
                    {test.settings.allowCalculator && (
                      <li>A scientific calculator tool is available during the test.</li>
                    )}
                  </ul>
                </div>

                <Separator />

                <div className="text-center">
                  <Button size="lg" onClick={handleStartTest}>
                    Start Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Section: {test.sections[currentSection]?.title}</CardTitle>
                        <CardDescription>
                          Question {currentQuestion + 1} of {test.sections[currentSection]?.questions.length || 0}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{formatTime(timeLeft)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {test.sections[currentSection]?.questions[currentQuestion] ? (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">
                            {currentQuestion + 1}. {test.sections[currentSection].questions[currentQuestion].text}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {test.sections[currentSection].questions[currentQuestion].points} points
                          </p>
                        </div>

                        {test.sections[currentSection].questions[currentQuestion].type === "Multiple Choice" && (
                          <div className="space-y-3">
                            {test.sections[currentSection].questions[currentQuestion].options?.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`option-${index}`}
                                  name={`question-${test.sections[currentSection].questions[currentQuestion].id}`}
                                  value={option}
                                  checked={
                                    answers[test.sections[currentSection].questions[currentQuestion].id] === option
                                  }
                                  onChange={() =>
                                    handleAnswer(test.sections[currentSection].questions[currentQuestion].id, option)
                                  }
                                  className="h-4 w-4 text-primary focus:ring-primary border-input"
                                />
                                <label htmlFor={`option-${index}`} className="text-sm font-medium">
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}

                        {test.sections[currentSection].questions[currentQuestion].type === "Written Answer" && (
                          <textarea
                            rows={5}
                            placeholder="Type your answer here..."
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            value={
                              (answers[test.sections[currentSection].questions[currentQuestion].id] as string) || ""
                            }
                            onChange={(e) =>
                              handleAnswer(test.sections[currentSection].questions[currentQuestion].id, e.target.value)
                            }
                          ></textarea>
                        )}

                        {test.sections[currentSection].questions[currentQuestion].type === "Coding" && (
                          <div className="border rounded-md overflow-hidden">
                            <div className="bg-muted p-2 border-b">
                              <span className="text-sm font-medium">Code Editor</span>
                            </div>
                            <textarea
                              rows={10}
                              placeholder="// Write your code here"
                              className="w-full p-2 font-mono text-sm bg-black text-white"
                              value={
                                (answers[test.sections[currentSection].questions[currentQuestion].id] as string) || ""
                              }
                              onChange={(e) =>
                                handleAnswer(
                                  test.sections[currentSection].questions[currentQuestion].id,
                                  e.target.value,
                                )
                              }
                            ></textarea>
                          </div>
                        )}

                        <div className="flex justify-between pt-4">
                          <Button
                            variant="outline"
                            onClick={handlePrevQuestion}
                            disabled={currentSection === 0 && currentQuestion === 0}
                          >
                            Previous
                          </Button>
                          <Button
                            onClick={handleNextQuestion}
                            disabled={
                              currentSection === test.sections.length - 1 &&
                              currentQuestion === test.sections[currentSection].questions.length - 1
                            }
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Questions Found</h3>
                        <p className="text-muted-foreground mb-4">
                          This section doesn't have any questions yet. Add questions in the test editor.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/employee/assessment/tests/${testId}/edit`)}
                        >
                          Edit Test
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Completion</span>
                          <span>{calculateProgress()}%</span>
                        </div>
                        <Progress value={calculateProgress()} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Question Navigator</h4>
                        {test.sections.map((section, sIndex) => (
                          <div key={section.id} className="space-y-1">
                            <h5 className="text-xs font-medium text-muted-foreground">{section.title}</h5>
                            <div className="flex flex-wrap gap-1">
                              {section.questions.map((question, qIndex) => (
                                <button
                                  key={question.id}
                                  onClick={() => {
                                    setCurrentSection(sIndex)
                                    setCurrentQuestion(qIndex)
                                  }}
                                  className={`w-6 h-6 text-xs flex items-center justify-center rounded-sm ${
                                    currentSection === sIndex && currentQuestion === qIndex
                                      ? "bg-primary text-primary-foreground"
                                      : answers[question.id] &&
                                          (typeof answers[question.id] === "string"
                                            ? answers[question.id] !== ""
                                            : (answers[question.id] as string[]).length > 0)
                                        ? "bg-muted-foreground/20"
                                        : "bg-muted"
                                  }`}
                                >
                                  {qIndex + 1}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Webcam monitoring */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Webcam Monitoring</h4>
                        <div className="aspect-video bg-black rounded-md overflow-hidden">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your webcam is active for proctoring purposes
                        </p>
                        <Button variant="outline" size="sm" className="mt-2 w-full" onClick={startWebcam}>
                          Start Webcam
                        </Button>
                      </div>

                      {test.settings.allowCalculator && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium mb-2">Calculator</h4>
                          <Button variant="outline" className="w-full" onClick={() => setShowCalculator(true)}>
                            <Calculator className="h-4 w-4 mr-2" />
                            Open Scientific Calculator
                          </Button>
                        </div>
                      )}

                      <div className="pt-6">
                        <Button className="w-full" variant="destructive" onClick={handleSubmitTest}>
                          Submit Test
                        </Button>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          You won&apos;t be able to change your answers after submission.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* System Check Dialog */}
        <Dialog open={showSystemCheck} onOpenChange={setShowSystemCheck}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>System Check</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pre-Exam Verification</CardTitle>
                  <CardDescription>Complete system check and ID verification before starting the exam</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between border rounded-md p-2 bg-muted/30">
                    <div className="w-1/3 text-center font-medium bg-background p-2 rounded-sm">System Check</div>
                    <div className="w-1/3 text-center text-muted-foreground p-2">ID Verification</div>
                    <div className="w-1/3 text-center text-muted-foreground p-2">Exam Rules</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="w-full">
                      <Progress value={75} className="h-2 mb-2" />
                      <p className="text-sm text-muted-foreground">System check progress: 75%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="aspect-video bg-black rounded-md overflow-hidden relative">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      {!systemChecks.cameraAccess && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                          <div className="flex flex-col items-center">
                            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                            <p>Camera access denied</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={startWebcam}
                              className="mt-2 bg-white text-black hover:bg-gray-200"
                            >
                              Try Again
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center">
                          {systemChecks.cameraAccess ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          <span>Camera Access</span>
                        </div>
                        {!systemChecks.cameraAccess && (
                          <Button size="sm" onClick={startWebcam}>
                            Allow
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center">
                          {systemChecks.fullscreenMode ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                          )}
                          <span>Fullscreen Mode</span>
                        </div>
                        {!systemChecks.fullscreenMode && (
                          <Button size="sm" onClick={enableFullscreen}>
                            Enable
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center">
                          {systemChecks.compatibleBrowser ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          <span>Compatible Browser</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center">
                          {systemChecks.tabFocus ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          <span>Tab Focus</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setShowSystemCheck(false)}>
                      Close Preview
                    </Button>
                    <Button
                      onClick={() => {
                        setShowSystemCheck(false)
                        setShowIdVerification(true)
                      }}
                    >
                      Next: ID Verification
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>

        {/* ID Verification Dialog */}
        <Dialog open={showIdVerification} onOpenChange={setShowIdVerification}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>ID Verification</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pre-Exam Verification</CardTitle>
                  <CardDescription>Complete system check and ID verification before starting the exam</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between border rounded-md p-2 bg-muted/30">
                    <div className="w-1/3 text-center text-muted-foreground p-2">System Check</div>
                    <div className="w-1/3 text-center font-medium bg-background p-2 rounded-sm">ID Verification</div>
                    <div className="w-1/3 text-center text-muted-foreground p-2">Exam Rules</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-id">Student ID Number</Label>
                        <Input
                          id="student-id"
                          placeholder="Enter your student ID"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Upload ID Card</Label>
                        {idCardImage ? (
                          <div className="relative border rounded-md overflow-hidden">
                            <img
                              src={idCardImage || "/placeholder.svg?height=200&width=320"}
                              alt="ID Card"
                              className="w-full h-auto max-h-[200px] object-contain"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 rounded-full"
                              onClick={() => setIdCardImage(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">Click to upload ID card</p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Upload
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIdCardImage("/placeholder.svg?height=200&width=320")}
                              >
                                Capture
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Capture Your Face</Label>
                        {faceImage ? (
                          <div className="relative border rounded-md overflow-hidden">
                            <img
                              src={faceImage || "/placeholder.svg?height=200&width=320"}
                              alt="Face"
                              className="w-full h-auto max-h-[200px] object-contain"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 rounded-full"
                              onClick={() => setFaceImage(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                            <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">Capture your face using webcam</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                startWebcam()
                                setFaceImage("/placeholder.svg?height=200&width=320")
                              }}
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              Capture
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowIdVerification(false)
                        setShowSystemCheck(true)
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        setShowIdVerification(false)
                        setShowRules(true)
                      }}
                    >
                      Next: Exam Rules
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>

        {/* Exam Rules Dialog */}
        <Dialog open={showRules} onOpenChange={setShowRules}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Exam Rules</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pre-Exam Verification</CardTitle>
                  <CardDescription>Complete system check and ID verification before starting the exam</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between border rounded-md p-2 bg-muted/30">
                    <div className="w-1/3 text-center text-muted-foreground p-2">System Check</div>
                    <div className="w-1/3 text-center text-muted-foreground p-2">ID Verification</div>
                    <div className="w-1/3 text-center font-medium bg-background p-2 rounded-sm">Exam Rules</div>
                  </div>

                  <div className="bg-muted p-4 rounded-md">
                    <h2 className="text-xl font-bold mb-2">{test.name}</h2>
                    <p className="text-muted-foreground">{test.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span>{test.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-muted-foreground" />
                        <span>Passing score: {test.passingScore}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                        <span>{test.sections?.length || 0} sections</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Exam Rules</h3>

                    <div className="space-y-2 p-4 border rounded-md">
                      <p className="font-medium">During this exam:</p>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>You must remain on the exam tab at all times</li>
                        <li>Your webcam must remain on throughout the exam</li>
                        <li>No other applications should be open on your device</li>
                        <li>No communication with others is allowed</li>
                        <li>You cannot copy or distribute exam content</li>
                        {test.settings?.preventTabSwitching && (
                          <li className="text-amber-600">Tab switching is not allowed and will be recorded</li>
                        )}
                        {test.settings?.autoSubmit && (
                          <li className="text-amber-600">The exam will be automatically submitted when time expires</li>
                        )}
                      </ul>
                    </div>

                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium mb-2">Test Instructions</h4>
                      <div className="text-muted-foreground">
                        {test.instructions ? (
                          <p>{test.instructions}</p>
                        ) : (
                          <p>No specific instructions provided for this test.</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="accept-rules"
                        checked={acceptedRules}
                        onCheckedChange={(checked) => setAcceptedRules(checked === true)}
                      />
                      <Label htmlFor="accept-rules" className="text-sm">
                        I have read and agree to follow all exam rules and instructions
                      </Label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRules(false)
                        setShowIdVerification(true)
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        setShowRules(false)
                        setActiveTab("test")
                      }}
                      disabled={!acceptedRules}
                    >
                      Start Exam
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tab Switching Warning Dialog */}
        <Dialog open={showTabWarning} onOpenChange={setShowTabWarning}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Warning: Tab Switching Detected</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>You have switched tabs or left the test window. This activity is recorded and may affect your test.</p>
              <p className="mt-2 font-medium">Tab switches detected: {tabSwitchCount}</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowTabWarning(false)}>Continue Test</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Scientific Calculator Dialog */}
        {test?.settings.allowCalculator && (
          <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
            <DialogContent className="sm:max-w-[350px]">
              <DialogHeader>
                <DialogTitle>Scientific Calculator</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="border rounded-md p-2 mb-4 text-right font-mono text-xl h-12 flex items-center justify-end overflow-x-auto">
                  {calculatorValue}
                </div>

                <div className="grid grid-cols-4 gap-1">
                  <Button variant="outline" onClick={handleCalculatorClear}>
                    C
                  </Button>
                  <Button variant="outline" onClick={() => handleCalculatorOperation("/")}>
                    ÷
                  </Button>
                  <Button variant="outline" onClick={() => handleCalculatorOperation("*")}>
                    ×
                  </Button>
                  <Button variant="outline" onClick={() => handleCalculatorOperation("-")}>
                    -
                  </Button>

                  <Button variant="outline" onClick={() => handleCalculatorInput("7")}>
                    7
                  </Button>
                  <Button variant="outline" onClick={() => handleCalculatorInput("8")}>
                    8
                  </Button>
                  <Button variant="outline" onClick={() => handleCalculatorInput("9")}>
                    9
                  </Button>
                  <Button variant="outline" onClick={() => handleCalculatorOperation("+")}>
                    +
                  </Button>

                  <Button variant="outline" onClick={() => handleCalculatorInput("4")}>
                    4
                  </Button>
                  <Button variant="outline" onClick={() => handleCalculatorInput("5")}>
                    5
                  </Button>
                  <Button variant="outline" onClick={() => handleCalculatorInput("6")}>
                    6
                  </Button>
                  <Button variant="outline" onClick={() => handleCalculatorOperation("^")}>
                    x^y
                  </Button>

                  <Button variant="outline" onClick={() => handleCalculatorInput("1")}>
                    1
                  </Button>
                  <Button variant="outline" onClick={() => handleCalculatorInput("2")}>
                    2
                  </Button>
                  <Button variant="outline" onClick={() => handleCalculatorInput("3")}>
                    3
                  </Button>
                  <Button variant="outline" onClick={handleCalculatorEquals}>
                    =
                  </Button>

                  <Button variant="outline" onClick={() => handleCalculatorInput("0")} className="col-span-2">
                    0
                  </Button>
                  <Button variant="outline" onClick={() => handleCalculatorInput(".")}>
                    .
                  </Button>
                  <Button variant="outline" onClick={() => handleCalculatorInput("0")}>
                    Ans
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
