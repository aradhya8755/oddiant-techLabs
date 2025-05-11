import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { UserIcon, LogIn } from "lucide-react"

export default function UserAuthPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl text-white font-bold mb-8 text-center">User Portal</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Card className="w-full transition-all duration-300 hover:shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <UserIcon className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Register</CardTitle>
            <CardDescription>Create a new user account</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 mb-6">
              Sign up to access exclusive resources, track your applications, and connect with opportunities.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full hover:bg-green-600 hover:text-black">
                Register Now
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="w-full transition-all duration-300 hover:shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <LogIn className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Access your existing account</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 mb-6">
              Already have an account? Sign in to continue your journey and access your dashboard.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full hover:text-black text-white bg-black hover:bg-green-600">
                Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Need help?{" "}
          <Link href="/contact" className="text-blue-600 hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  )
}
