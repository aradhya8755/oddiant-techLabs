import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">About Oddiant TechLabs</h1>

      <div className="max-w-3xl mx-auto prose prose-blue">
        <p className="lead">
          At Oddiant TechLabs, we're committed to bridging the gap between education and industry requirements,
          providing students with the skills they need to excel in the tech world.
        </p>

        <h2>Our Mission</h2>
        <p>
          Our mission is to empower students with cutting-edge technical knowledge, practical experience, and industry
          connections to build successful careers in technology.
        </p>

        <h2>What We Offer</h2>
        <ul>
          <li>Industry-relevant curriculum designed by experts</li>
          <li>Hands-on practical training and real-world projects</li>
          <li>Placement assistance and career guidance</li>
          <li>Mentorship from industry professionals</li>
          <li>Networking opportunities with leading tech companies</li>
        </ul>

        <h2>Our Approach</h2>
        <p>
          We believe in a holistic approach to education that combines technical skills with soft skills development.
          Our programs are designed to challenge students and prepare them for the demands of the tech industry.
        </p>

        <h2>Join Our Community</h2>
        <p>
          Whether you're a student looking to start your tech journey or a professional seeking to upskill, Oddiant
          TechLabs offers a supportive community and resources to help you achieve your goals.
        </p>

        <div className="flex justify-center mt-8">
          <Link href="/auth/register">
            <Button size="lg">Register Now</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
