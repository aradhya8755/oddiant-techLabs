export interface Testimonial {
    id: number;
    name: string;
    position: string;
    company: string;
    testimonial: string;
    avatar: string;
  }
  
  export interface Client {
    id: number;
    name: string;
    position: string;
    company: string;
    avatar: string;
    orbitRadius: number;
    orbitSpeed: number;
    size: number;
  }
  
  export const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Marketing Director",
      company: "TechCorp",
      testimonial: "This service transformed our online presence. The results exceeded our expectations in every way possible.",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      id: 2,
      name: "James Wilson",
      position: "CEO",
      company: "Innovate Solutions",
      testimonial: "The level of professionalism and attention to detail was outstanding. I couldn't be happier with the outcome.",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg"
    },
    {
      id: 3,
      name: "Emily Davis",
      position: "Product Manager",
      company: "CreativeMinds",
      testimonial: "Working with this team was a pleasure from start to finish. They understood our vision and delivered beyond our expectations.",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg"
    },
    {
      id: 4,
      name: "Michael Chen",
      position: "CTO",
      company: "FutureTech",
      testimonial: "The innovative approach and technical expertise demonstrated throughout the project were truly impressive.",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg"
    },
    {
      id: 5,
      name: "Lisa Patel",
      position: "Operations Director",
      company: "Global Systems",
      testimonial: "Exceptional service and outstanding results. They've helped us scale our business to new heights.",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg"
    },
    {
      id: 6,
      name: "Robert Taylor",
      position: "Founder",
      company: "NextGen Startup",
      testimonial: "Their strategic insights and execution capabilities made all the difference in our product launch.",
      avatar: "https://randomuser.me/api/portraits/men/56.jpg"
    },
    {
      id: 7,
      name: "Jessica Martinez",
      position: "Creative Director",
      company: "Design Forward",
      testimonial: "The creative solutions and attention to user experience resulted in a product that our customers absolutely love.",
      avatar: "https://randomuser.me/api/portraits/women/17.jpg"
    }
  ];
  
  export const clients: Client[] = [
    {
      id: 1,
      name: "Emma Richardson",
      position: "Chief Executive Officer",
      company: "Horizon Innovations",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      orbitRadius: 150,
      orbitSpeed: 20,
      size: 50
    },
    {
      id: 2,
      name: "Michael Brooks",
      position: "Technology Director",
      company: "NexGen Solutions",
      avatar: "https://randomuser.me/api/portraits/men/65.jpg",
      orbitRadius: 180,
      orbitSpeed: 25,
      size: 60
    },
    {
      id: 3,
      name: "Priya Sharma",
      position: "Marketing Executive",
      company: "Global Reach Inc.",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      orbitRadius: 220,
      orbitSpeed: 15,
      size: 55
    },
    {
      id: 4,
      name: "Thomas Reynolds",
      position: "Senior Investment Analyst",
      company: "Meridian Capital",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
      orbitRadius: 250,
      orbitSpeed: 18,
      size: 65
    },
    {
      id: 5,
      name: "Sophia Chen",
      position: "Lead Product Designer",
      company: "Innovative UX",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      orbitRadius: 130,
      orbitSpeed: 22,
      size: 45
    },
    {
      id: 6,
      name: "Daniel Martinez",
      position: "Operations Manager",
      company: "Streamline Corp",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      orbitRadius: 170,
      orbitSpeed: 28,
      size: 50
    },
    {
      id: 7,
      name: "Olivia Thompson",
      position: "Creative Director",
      company: "Vivid Design Group",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      orbitRadius: 190,
      orbitSpeed: 16,
      size: 55
    },
    {
      id: 8,
      name: "James Wilson",
      position: "Financial Controller",
      company: "Strategic Finance",
      avatar: "https://randomuser.me/api/portraits/men/33.jpg",
      orbitRadius: 210,
      orbitSpeed: 20,
      size: 60
    },
    {
      id: 9,
      name: "Natalie Rodriguez",
      position: "Head of Human Resources",
      company: "PeopleFirst Inc.",
      avatar: "https://randomuser.me/api/portraits/women/17.jpg",
      orbitRadius: 160,
      orbitSpeed: 24,
      size: 45
    },
    {
      id: 10,
      name: "Robert Chang",
      position: "Research & Development Lead",
      company: "Frontiers Technologies",
      avatar: "https://randomuser.me/api/portraits/men/76.jpg",
      orbitRadius: 140,
      orbitSpeed: 19,
      size: 50
    },
    {
      id: 11,
      name: "Elizabeth Parker",
      position: "Communications Director",
      company: "Clarity Media Group",
      avatar: "https://randomuser.me/api/portraits/women/54.jpg",
      orbitRadius: 200,
      orbitSpeed: 23,
      size: 55
    },
    {
      id: 12,
      name: "David Nguyen",
      position: "IT Security Manager",
      company: "CyberShield Solutions",
      avatar: "https://randomuser.me/api/portraits/men/56.jpg",
      orbitRadius: 230,
      orbitSpeed: 17,
      size: 60
    },
    {
      id: 13,
      name: "Jennifer Lee",
      position: "Sales Executive",
      company: "Peak Performance Sales",
      avatar: "https://randomuser.me/api/portraits/women/67.jpg",
      orbitRadius: 180,
      orbitSpeed: 21,
      size: 45
    },
    {
      id: 14,
      name: "Christopher Taylor",
      position: "Business Development",
      company: "Growth Strategies Inc.",
      avatar: "https://randomuser.me/api/portraits/men/93.jpg",
      orbitRadius: 160,
      orbitSpeed: 26,
      size: 50
    },
    {
      id: 15,
      name: "Maria Garcia",
      position: "Client Relations Manager",
      company: "Premier Partners LLC",
      avatar: "https://randomuser.me/api/portraits/women/85.jpg",
      orbitRadius: 190,
      orbitSpeed: 22,
      size: 55
    }
  ];
  