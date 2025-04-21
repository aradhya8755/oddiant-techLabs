interface JobCardProps {
    jobRole: string
    location: string
    experience : number
    skills : string
  }
  
  function JobCard({ jobRole, location, experience, skills }: JobCardProps) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
        <h3 className="text-xxl font-bold text-gray-800 mb-2">{jobRole}</h3>
        <div className="flex items-center text-gray-600 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        <h2>{location}</h2>
         
         <h2 className="-ml-64 mt-20">{experience}</h2>
           <h4 className="-mb-32 mr-32">{skills}</h4>
          {/*<span>{location}</span>
          <span>{location}</span> */}
        </div>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
          Apply Now
        </button>
      </div>
    )
  }
  
  export default JobCard
  