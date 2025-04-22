import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const courses = [
  {
    id: 1,
    title: "Web Development Fundamentals",
    description: "Learn the basics of HTML, CSS, and JavaScript to build modern websites.",
    duration: "8 weeks",
    level: "Beginner",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Advanced React Development",
    description: "Master React.js and build complex single-page applications.",
    duration: "10 weeks",
    level: "Intermediate",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Full Stack Development",
    description: "Learn both frontend and backend technologies to become a full stack developer.",
    duration: "12 weeks",
    level: "Advanced",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    title: "Mobile App Development",
    description: "Build native mobile applications for iOS and Android using React Native.",
    duration: "10 weeks",
    level: "Intermediate",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    title: "Data Science Fundamentals",
    description: "Introduction to data analysis, visualization, and machine learning concepts.",
    duration: "8 weeks",
    level: "Beginner",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 6,
    title: "Cloud Computing & DevOps",
    description: "Learn to deploy and scale applications using cloud services and DevOps practices.",
    duration: "8 weeks",
    level: "Intermediate",
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">Our Courses</h1>
      <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto mb-12">
        Explore our comprehensive range of tech courses designed to help you advance your career.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
            </div>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>
                <div className="flex space-x-4 mt-2">
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{course.duration}</span>
                  <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{course.level}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{course.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Course Details</Button>
              <Link href="/auth/register">
                <Button>Enroll Now</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Register now to browse all courses, track your progress, and connect with instructors and fellow students.
        </p>
        <Link href="/auth/register">
          <Button size="lg">Create Your Account</Button>
        </Link>
      </div>
    </div>
  )
}
