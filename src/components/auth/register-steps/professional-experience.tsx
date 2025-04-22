"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { FormData } from "../register-form"
import { Plus, Trash2, X } from "lucide-react"
import { useState, useEffect } from "react"

// Departments data
const departments = [
  "Business & Strategy",
  "Human Resources (HR) / Recruiter",
  "Finance & Accounting",
  "Marketing & Communications",
  "Sales & Business Development",
  "Information Technology (IT)",
  "Engineering & Production",
  "Research & Development (R&D)",
  "Operations",
  "Customer Success",
  "Legal & Compliance",
  "Administrative / Office Management",
].sort()

// Cities data organized by state and sorted alphabetically
const citiesData = [
  {
    state: "Andaman and Nicobar Islands (union territory)",
    cities: ["Port Blair"],
  },
  {
    state: "Andhra Pradesh",
    cities: [
      "Adoni",
      "Amaravati",
      "Anantapur",
      "Chandragiri",
      "Chittoor",
      "Dowlaiswaram",
      "Eluru",
      "Guntur",
      "Kadapa",
      "Kakinada",
      "Kurnool",
      "Machilipatnam",
      "Nagarjunakoṇḍa",
      "Rajahmundry",
      "Srikakulam",
      "Tirupati",
      "Vijayawada",
      "Visakhapatnam",
      "Vizianagaram",
      "Yemmiganur",
    ].sort(),
  },
  {
    state: "Arunachal Pradesh",
    cities: ["Itanagar"],
  },
  {
    state: "Assam",
    cities: [
      "Dhuburi",
      "Dibrugarh",
      "Dispur",
      "Guwahati",
      "Jorhat",
      "Nagaon",
      "Sivasagar",
      "Silchar",
      "Tezpur",
      "Tinsukia",
    ].sort(),
  },
  {
    state: "Bihar",
    cities: [
      "Ara",
      "Barauni",
      "Begusarai",
      "Bettiah",
      "Bhagalpur",
      "Bihar Sharif",
      "Bodh Gaya",
      "Buxar",
      "Chapra",
      "Darbhanga",
      "Dehri",
      "Dinapur Nizamat",
      "Gaya",
      "Hajipur",
      "Jamalpur",
      "Katihar",
      "Madhubani",
      "Motihari",
      "Munger",
      "Muzaffarpur",
      "Patna",
      "Purnia",
      "Pusa",
      "Saharsa",
      "Samastipur",
      "Sasaram",
      "Sitamarhi",
      "Siwan",
    ].sort(),
  },
  {
    state: "Chandigarh (union territory)",
    cities: ["Chandigarh"],
  },
  {
    state: "Chhattisgarh",
    cities: ["Ambikapur", "Bhilai", "Bilaspur", "Dhamtari", "Durg", "Jagdalpur", "Raipur", "Rajnandgaon"].sort(),
  },
  {
    state: "Dadra and Nagar Haveli and Daman and Diu (union territory)",
    cities: ["Daman", "Diu", "Silvassa"],
  },
  {
    state: "Delhi (national capital territory)",
    cities: ["Delhi", "New Delhi"],
  },
  {
    state: "Goa",
    cities: ["Madgaon", "Panaji"],
  },
  {
    state: "Gujarat",
    cities: [
      "Ahmadabad",
      "Amreli",
      "Bharuch",
      "Bhavnagar",
      "Bhuj",
      "Dwarka",
      "Gandhinagar",
      "Godhra",
      "Jamnagar",
      "Junagadh",
      "Kandla",
      "Khambhat",
      "Kheda",
      "Mahesana",
      "Morbi",
      "Nadiad",
      "Navsari",
      "Okha",
      "Palanpur",
      "Patan",
      "Porbandar",
      "Rajkot",
      "Surat",
      "Surendranagar",
      "Valsad",
      "Veraval",
    ].sort(),
  },
  {
    state: "Haryana",
    cities: [
      "Ambala",
      "Bhiwani",
      "Chandigarh",
      "Faridabad",
      "Firozpur Jhirka",
      "Gurugram",
      "Hansi",
      "Hisar",
      "Jind",
      "Kaithal",
      "Karnal",
      "Kurukshetra",
      "Panipat",
      "Pehowa",
      "Rewari",
      "Rohtak",
      "Sirsa",
      "Sonipat",
    ].sort(),
  },
  {
    state: "Himachal Pradesh",
    cities: [
      "Bilaspur",
      "Chamba",
      "Dalhousie",
      "Dharmshala",
      "Hamirpur",
      "Kangra",
      "Kullu",
      "Mandi",
      "Nahan",
      "Shimla",
      "Una",
    ].sort(),
  },
  {
    state: "Jammu and Kashmir (union territory)",
    cities: [
      "Anantnag",
      "Baramula",
      "Doda",
      "Gulmarg",
      "Jammu",
      "Kathua",
      "Punch",
      "Rajouri",
      "Srinagar",
      "Udhampur",
    ].sort(),
  },
  {
    state: "Jharkhand",
    cities: [
      "Bokaro",
      "Chaibasa",
      "Deoghar",
      "Dhanbad",
      "Dumka",
      "Giridih",
      "Hazaribag",
      "Jamshedpur",
      "Jharia",
      "Rajmahal",
      "Ranchi",
      "Saraikela",
    ].sort(),
  },
  {
    state: "Karnataka",
    cities: [
      "Badami",
      "Ballari",
      "Bengaluru",
      "Belagavi",
      "Bhadravati",
      "Bidar",
      "Chikkamagaluru",
      "Chitradurga",
      "Davangere",
      "Halebidu",
      "Hassan",
      "Hubballi-Dharwad",
      "Kalaburagi",
      "Kolar",
      "Madikeri",
      "Mandya",
      "Mangaluru",
      "Mysuru",
      "Raichur",
      "Shivamogga",
      "Shimoga",
      "Shravanabelagola",
      "Shrirangapattana",
      "Tumakuru",
      "Vijayapura",
    ].sort(),
  },
  {
    state: "Kerala",
    cities: [
      "Alappuzha",
      "Vatakara",
      "Idukki",
      "Kannur",
      "Kochi",
      "Kollam",
      "Kottayam",
      "Kozhikode",
      "Mattancheri",
      "Palakkad",
      "Thalassery",
      "Thiruvananthapuram",
      "Thrissur",
    ].sort(),
  },
  {
    state: "Ladakh (union territory)",
    cities: ["Kargil", "Leh"],
  },
  {
    state: "Madhya Pradesh",
    cities: [
      "Balaghat",
      "Barwani",
      "Betul",
      "Bharhut",
      "Bhind",
      "Bhojpur",
      "Bhopal",
      "Burhanpur",
      "Chhatarpur",
      "Chhindwara",
      "Damoh",
      "Datia",
      "Dewas",
      "Dhar",
      "Dr. Ambedkar Nagar (Mhow)",
      "Guna",
      "Gwalior",
      "Hoshangabad",
      "Indore",
      "Itarsi",
      "Jabalpur",
      "Jhabua",
      "Khajuraho",
      "Khandwa",
      "Khargone",
      "Maheshwar",
      "Mandla",
      "Mandsaur",
      "Morena",
      "Murwara",
      "Narsimhapur",
      "Narsinghgarh",
      "Narwar",
      "Neemuch",
      "Nowgong",
      "Orchha",
      "Panna",
      "Raisen",
      "Rajgarh",
      "Ratlam",
      "Rewa",
      "Sagar",
      "Sarangpur",
      "Satna",
      "Sehore",
      "Seoni",
      "Shahdol",
      "Shajapur",
      "Sheopur",
      "Shivpuri",
      "Ujjain",
      "Vidisha",
    ].sort(),
  },
  {
    state: "Maharashtra",
    cities: [
      "Ahmadnagar",
      "Akola",
      "Amravati",
      "Aurangabad",
      "Bhandara",
      "Bhusawal",
      "Bid",
      "Buldhana",
      "Chandrapur",
      "Daulatabad",
      "Dhule",
      "Jalgaon",
      "Kalyan",
      "Karli",
      "Kolhapur",
      "Mahabaleshwar",
      "Malegaon",
      "Matheran",
      "Mumbai",
      "Nagpur",
      "Nanded",
      "Nashik",
      "Osmanabad",
      "Pandharpur",
      "Parbhani",
      "Pune",
      "Ratnagiri",
      "Sangli",
      "Satara",
      "Sevagram",
      "Solapur",
      "Thane",
      "Ulhasnagar",
      "Vasai-Virar",
      "Wardha",
      "Yavatmal",
    ].sort(),
  },
  {
    state: "Manipur",
    cities: ["Imphal"],
  },
  {
    state: "Meghalaya",
    cities: ["Cherrapunji", "Shillong"],
  },
  {
    state: "Mizoram",
    cities: ["Aizawl", "Lunglei"],
  },
  {
    state: "Nagaland",
    cities: ["Kohima", "Mon", "Phek", "Wokha", "Zunheboto"].sort(),
  },
  {
    state: "Odisha",
    cities: [
      "Balangir",
      "Baleshwar",
      "Baripada",
      "Bhubaneshwar",
      "Brahmapur",
      "Cuttack",
      "Dhenkanal",
      "Kendujhar",
      "Konark",
      "Koraput",
      "Paradip",
      "Phulabani",
      "Puri",
      "Sambalpur",
      "Udayagiri",
    ].sort(),
  },
  {
    state: "Puducherry (union territory)",
    cities: ["Karaikal", "Mahe", "Puducherry", "Yanam"].sort(),
  },
  {
    state: "Punjab",
    cities: [
      "Amritsar",
      "Batala",
      "Chandigarh",
      "Faridkot",
      "Firozpur",
      "Gurdaspur",
      "Hoshiarpur",
      "Jalandhar",
      "Kapurthala",
      "Ludhiana",
      "Nabha",
      "Patiala",
      "Rupnagar",
      "Sangrur",
    ].sort(),
  },
  {
    state: "Rajasthan",
    cities: [
      "Abu",
      "Ajmer",
      "Alwar",
      "Amer",
      "Barmer",
      "Beawar",
      "Bharatpur",
      "Bhilwara",
      "Bikaner",
      "Bundi",
      "Chittaurgarh",
      "Churu",
      "Dhaulpur",
      "Dungarpur",
      "Ganganagar",
      "Hanumangarh",
      "Jaipur",
      "Jaisalmer",
      "Jalor",
      "Jhalawar",
      "Jhunjhunu",
      "Jodhpur",
      "Kishangarh",
      "Kota",
      "Merta",
      "Nagaur",
      "Nathdwara",
      "Pali",
      "Phalodi",
      "Pushkar",
      "Sawai Madhopur",
      "Shahpura",
      "Sikar",
      "Sirohi",
      "Tonk",
      "Udaipur",
    ].sort(),
  },
  {
    state: "Sikkim",
    cities: ["Gangtok", "Gyalshing", "Lachung", "Mangan"].sort(),
  },
  {
    state: "Tamil Nadu",
    cities: [
      "Arcot",
      "Chengalpattu",
      "Chennai",
      "Chidambaram",
      "Coimbatore",
      "Cuddalore",
      "Dharmapuri",
      "Dindigul",
      "Erode",
      "Kanchipuram",
      "Kanniyakumari",
      "Kodaikanal",
      "Kumbakonam",
      "Madurai",
      "Mamallapuram",
      "Nagappattinam",
      "Nagercoil",
      "Palayamkottai",
      "Pudukkottai",
      "Rajapalayam",
      "Ramanathapuram",
      "Salem",
      "Thanjavur",
      "Tiruchchirappalli",
      "Tirunelveli",
      "Tiruppur",
      "Thoothukudi",
      "Udhagamandalam",
      "Vellore",
    ].sort(),
  },
  {
    state: "Telangana",
    cities: ["Hyderabad", "Karimnagar", "Khammam", "Mahbubnagar", "Nizamabad", "Sangareddi", "Warangal"].sort(),
  },
  {
    state: "Tripura",
    cities: ["Agartala"],
  },
  {
    state: "Uttar Pradesh",
    cities: [
      "Agra",
      "Aligarh",
      "Amroha",
      "Ayodhya",
      "Azamgarh",
      "Bahraich",
      "Ballia",
      "Banda",
      "Bara Banki",
      "Bareilly",
      "Basti",
      "Bijnor",
      "Bithur",
      "Budaun",
      "Bulandshahr",
      "Deoria",
      "Etah",
      "Etawah",
      "Faizabad",
      "Farrukhabad-cum-Fatehgarh",
      "Fatehpur",
      "Fatehpur Sikri",
      "Ghaziabad",
      "Ghazipur",
      "Gonda",
      "Gorakhpur",
      "Hamirpur",
      "Hardoi",
      "Hathras",
      "Jalaun",
      "Jaunpur",
      "Jhansi",
      "Kannauj",
      "Kanpur",
      "Lakhimpur",
      "Lalitpur",
      "Lucknow",
      "Mainpuri",
      "Mathura",
      "Meerut",
      "Mirzapur-Vindhyachal",
      "Moradabad",
      "Muzaffarnagar",
      "Noida",
      "Partapgarh",
      "Pilibhit",
      "Prayagraj",
      "Rae Bareli",
      "Rampur",
      "Saharanpur",
      "Sambhal",
      "Shahjahanpur",
      "Sitapur",
      "Sultanpur",
      "Tehri",
      "Varanasi",
    ].sort(),
  },
  {
    state: "Uttarakhand",
    cities: ["Almora", "Dehra Dun", "Haridwar", "Mussoorie", "Nainital", "Pithoragarh"].sort(),
  },
  {
    state: "West Bengal",
    cities: [
      "Alipore",
      "Alipur Duar",
      "Asansol",
      "Baharampur",
      "Bally",
      "Balurghat",
      "Bankura",
      "Baranagar",
      "Barasat",
      "Barrackpore",
      "Basirhat",
      "Bhatpara",
      "Bishnupur",
      "Budge Budge",
      "Burdwan",
      "Chandernagore",
      "Darjeeling",
      "Diamond Harbour",
      "Dum Dum",
      "Durgapur",
      "Halisahar",
      "Haora",
      "Hugli",
      "Ingraj Bazar",
      "Jalpaiguri",
      "Kalimpong",
      "Kamarhati",
      "Kanchrapara",
      "Kharagpur",
      "Cooch Behar",
      "Kolkata",
      "Krishnanagar",
      "Malda",
      "Midnapore",
      "Murshidabad",
      "Nabadwip",
      "Palashi",
      "Panihati",
      "Purulia",
      "Raiganj",
      "Santipur",
      "Shantiniketan",
      "Shrirampur",
      "Siliguri",
      "Siuri",
      "Tamluk",
      "Titagarh",
    ].sort(),
  },
].sort((a, b) => a.state.localeCompare(b.state))

// Create a flat array of all cities for searching
const allCities = citiesData
  .flatMap((stateData) =>
    stateData.cities.map((city) => ({
      city,
      state: stateData.state,
    })),
  )
  .sort((a, b) => a.city.localeCompare(b.city))

interface ProfessionalExperienceFormProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
}

export default function ProfessionalExperienceForm({ formData, updateFormData }: ProfessionalExperienceFormProps) {
  const [citySearchTerm, setCitySearchTerm] = useState("")
  const [filteredCities, setFilteredCities] = useState(allCities)
  const [departmentSearchTerms, setDepartmentSearchTerms] = useState<string[]>(formData.experience.map(() => ""))
  const [filteredDepartments, setFilteredDepartments] = useState<string[][]>(formData.experience.map(() => departments))

  useEffect(() => {
    if (citySearchTerm) {
      const filtered = allCities.filter(
        (item) =>
          item.city.toLowerCase().includes(citySearchTerm.toLowerCase()) ||
          item.state.toLowerCase().includes(citySearchTerm.toLowerCase()),
      )
      setFilteredCities(filtered)
    } else {
      setFilteredCities(allCities)
    }
  }, [citySearchTerm])

  useEffect(() => {
    const newFilteredDepartments = departmentSearchTerms.map((term) => {
      if (term) {
        return departments.filter((dept) => dept.toLowerCase().includes(term.toLowerCase()))
      }
      return departments
    })
    setFilteredDepartments(newFilteredDepartments)
  }, [departmentSearchTerms])

  // Update department search terms array when experience items change
  useEffect(() => {
    if (departmentSearchTerms.length !== formData.experience.length) {
      setDepartmentSearchTerms(formData.experience.map(() => ""))
      setFilteredDepartments(formData.experience.map(() => departments))
    }
  }, [formData.experience.length, departmentSearchTerms.length])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
  }

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const updatedExperience = [...formData.experience]
    updatedExperience[index] = { ...updatedExperience[index], [field]: value }
    updateFormData({ experience: updatedExperience })
  }

  const addExperience = () => {
    updateFormData({
      experience: [
        ...formData.experience,
        { title: "", department: "", companyName: "", tenure: "", professionalSummary: "" },
      ],
    })
  }

  const removeExperience = (index: number) => {
    if (formData.experience.length > 1) {
      const updatedExperience = [...formData.experience]
      updatedExperience.splice(index, 1)
      updateFormData({ experience: updatedExperience })

      // Update department search terms
      const updatedDepartmentSearchTerms = [...departmentSearchTerms]
      updatedDepartmentSearchTerms.splice(index, 1)
      setDepartmentSearchTerms(updatedDepartmentSearchTerms)
    }
  }

  const handleShiftPreferenceChange = (value: string) => {
    const currentPreferences = [...formData.shiftPreference]
    const index = currentPreferences.indexOf(value)

    if (index === -1) {
      updateFormData({ shiftPreference: [...currentPreferences, value] })
    } else {
      currentPreferences.splice(index, 1)
      updateFormData({ shiftPreference: currentPreferences })
    }
  }

  const handleDepartmentSearchChange = (index: number, value: string) => {
    const updatedSearchTerms = [...departmentSearchTerms]
    updatedSearchTerms[index] = value
    setDepartmentSearchTerms(updatedSearchTerms)
  }

  const handleDepartmentSelect = (index: number, department: string) => {
    handleExperienceChange(index, "department", department)
    const updatedSearchTerms = [...departmentSearchTerms]
    updatedSearchTerms[index] = ""
    setDepartmentSearchTerms(updatedSearchTerms)
  }

  const addCity = (city: string) => {
    if (formData.preferenceCities.length < 5 && !formData.preferenceCities.includes(city)) {
      updateFormData({
        preferenceCities: [...formData.preferenceCities, city],
      })
      setCitySearchTerm("")
    }
  }

  const removeCity = (index: number) => {
    const updatedCities = [...formData.preferenceCities]
    updatedCities.splice(index, 1)
    updateFormData({ preferenceCities: updatedCities })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="totalExperience">
            Total Professional Experience (in years) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="totalExperience"
            name="totalExperience"
            type="number"
            min="0"
            step="0.5"
            value={formData.totalExperience}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Work Experience</h3>
          <Button type="button" variant="outline" size="sm" onClick={addExperience}>
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </div>

        {formData.experience.map((exp, index) => (
          <div key={index} className="p-4 border rounded-md mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Experience #{index + 1}</h4>
              {formData.experience.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor={`title-${index}`}>
                  Title/Designation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`title-${index}`}
                  value={exp.title}
                  onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`department-${index}`}>Department</Label>
                <div className="relative">
                  <Input
                    id={`department-${index}`}
                    value={departmentSearchTerms[index] || exp.department}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        handleExperienceChange(index, "department", "")
                      }
                      handleDepartmentSearchChange(index, e.target.value)
                    }}
                    placeholder="Search for a department..."
                  />
                  {departmentSearchTerms[index] && (
                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredDepartments[index].length > 0 ? (
                        filteredDepartments[index].map((dept) => (
                          <div
                            key={dept}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleDepartmentSelect(index, dept)}
                          >
                            {dept}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">No departments found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`companyName-${index}`}>
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`companyName-${index}`}
                  value={exp.companyName}
                  onChange={(e) => handleExperienceChange(index, "companyName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`tenure-${index}`}>
                  Tenure (e.g., "2 years 3 months") <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`tenure-${index}`}
                  value={exp.tenure}
                  onChange={(e) => handleExperienceChange(index, "tenure", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`professionalSummary-${index}`}>Professional Summary</Label>
              <Textarea
                id={`professionalSummary-${index}`}
                value={exp.professionalSummary || ""}
                onChange={(e) => handleExperienceChange(index, "professionalSummary", e.target.value)}
                rows={6}
                placeholder="Brief summary of your professional background"
                className="w-full"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentSalary">Current Salary (per annum)</Label>
          <Input
            id="currentSalary"
            name="currentSalary"
            value={formData.currentSalary}
            onChange={handleChange}
            placeholder="e.g., 500000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedSalary">
            Expected Salary (per annum) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="expectedSalary"
            name="expectedSalary"
            value={formData.expectedSalary}
            onChange={handleChange}
            placeholder="e.g., 600000"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="noticePeriod">Notice Period (in days)</Label>
        <Input
          id="noticePeriod"
          name="noticePeriod"
          type="number"
          min="0"
          value={formData.noticePeriod}
          onChange={handleChange}
          placeholder="e.g., 30"
        />
      </div>

      <div className="space-y-2">
        <Label>Shift Preference</Label>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="shift-day"
              checked={formData.shiftPreference.includes("day")}
              onCheckedChange={() => handleShiftPreferenceChange("day")}
            />
            <Label htmlFor="shift-day" className="font-normal">
              Day
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="shift-night"
              checked={formData.shiftPreference.includes("night")}
              onCheckedChange={() => handleShiftPreferenceChange("night")}
            />
            <Label htmlFor="shift-night" className="font-normal">
              Night
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="shift-flexible"
              checked={formData.shiftPreference.includes("flexible")}
              onCheckedChange={() => handleShiftPreferenceChange("flexible")}
            />
            <Label htmlFor="shift-flexible" className="font-normal">
              Flexible
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Preference Cities (Max 5)</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.preferenceCities.map((city, index) => (
            <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
              <span>{city}</span>
              <button
                type="button"
                onClick={() => removeCity(index)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="relative">
          <Input
            value={citySearchTerm}
            onChange={(e) => setCitySearchTerm(e.target.value)}
            placeholder="Search for a city..."
            disabled={formData.preferenceCities.length >= 5}
          />
          {citySearchTerm && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredCities.length > 0 ? (
                filteredCities.slice(0, 10).map((item) => (
                  <div
                    key={`${item.state}-${item.city}`}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => addCity(item.city)}
                  >
                    {item.city} <span className="text-gray-500 text-sm">({item.state})</span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500">No cities found</div>
              )}
            </div>
          )}
        </div>
        {formData.preferenceCities.length >= 5 && <p className="text-sm text-amber-600">Maximum 5 cities allowed</p>}
      </div>
    </div>
  )
}
