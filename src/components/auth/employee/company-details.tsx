"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { EmployeeFormData } from "@/app/auth/employee/register/page"
import { Plus, X, Search } from "lucide-react"

interface CompanyDetailsFormProps {
  formData: EmployeeFormData
  updateFormData: (data: Partial<EmployeeFormData>) => void
}

const industries = [
  "Information Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Hospitality",
  "Real Estate",
  "Construction",
  "Transportation",
  "Media & Entertainment",
  "Telecommunications",
  "Energy",
  "Agriculture",
  "Other",
]

const teamSizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5000+"]

// List of locations from India with city first, then state
const locations = [
  "Port Blair - Andaman and Nicobar Islands",
  "Adoni - Andhra Pradesh",
  "Amaravati - Andhra Pradesh",
  "Anantapur - Andhra Pradesh",
  "Chandragiri - Andhra Pradesh",
  "Chittoor - Andhra Pradesh",
  "Dowlaiswaram - Andhra Pradesh",
  "Eluru - Andhra Pradesh",
  "Guntur - Andhra Pradesh",
  "Kadapa - Andhra Pradesh",
  "Kakinada - Andhra Pradesh",
  "Kurnool - Andhra Pradesh",
  "Machilipatnam - Andhra Pradesh",
  "Nagarjunakoṇḍa - Andhra Pradesh",
  "Rajahmundry - Andhra Pradesh",
  "Srikakulam - Andhra Pradesh",
  "Tirupati - Andhra Pradesh",
  "Vijayawada - Andhra Pradesh",
  "Visakhapatnam - Andhra Pradesh",
  "Vizianagaram - Andhra Pradesh",
  "Yemmiganur - Andhra Pradesh",
  "Itanagar - Arunachal Pradesh",
  "Dhuburi - Assam",
  "Dibrugarh - Assam",
  "Dispur - Assam",
  "Guwahati - Assam",
  "Jorhat - Assam",
  "Nagaon - Assam",
  "Sivasagar - Assam",
  "Silchar - Assam",
  "Tezpur - Assam",
  "Tinsukia - Assam",
  "Ara - Bihar",
  "Barauni - Bihar",
  "Begusarai - Bihar",
  "Bettiah - Bihar",
  "Bhagalpur - Bihar",
  "Bihar Sharif - Bihar",
  "Bodh Gaya - Bihar",
  "Buxar - Bihar",
  "Chapra - Bihar",
  "Darbhanga - Bihar",
  "Dehri - Bihar",
  "Dinapur Nizamat - Bihar",
  "Gaya - Bihar",
  "Hajipur - Bihar",
  "Jamalpur - Bihar",
  "Katihar - Bihar",
  "Madhubani - Bihar",
  "Motihari - Bihar",
  "Munger - Bihar",
  "Muzaffarpur - Bihar",
  "Patna - Bihar",
  "Purnia - Bihar",
  "Pusa - Bihar",
  "Saharsa - Bihar",
  "Samastipur - Bihar",
  "Sasaram - Bihar",
  "Sitamarhi - Bihar",
  "Siwan - Bihar",
  "Chandigarh - Chandigarh",
  "Ambikapur - Chhattisgarh",
  "Bhilai - Chhattisgarh",
  "Bilaspur - Chhattisgarh",
  "Dhamtari - Chhattisgarh",
  "Durg - Chhattisgarh",
  "Jagdalpur - Chhattisgarh",
  "Raipur - Chhattisgarh",
  "Rajnandgaon - Chhattisgarh",
  "Daman - Dadra and Nagar Haveli and Daman and Diu",
  "Diu - Dadra and Nagar Haveli and Daman and Diu",
  "Silvassa - Dadra and Nagar Haveli and Daman and Diu",
  "Delhi - Delhi",
  "New Delhi - Delhi",
  "Madgaon - Goa",
  "Panaji - Goa",
  "Ahmadabad - Gujarat",
  "Amreli - Gujarat",
  "Bharuch - Gujarat",
  "Bhavnagar - Gujarat",
  "Bhuj - Gujarat",
  "Dwarka - Gujarat",
  "Gandhinagar - Gujarat",
  "Godhra - Gujarat",
  "Jamnagar - Gujarat",
  "Junagadh - Gujarat",
  "Kandla - Gujarat",
  "Khambhat - Gujarat",
  "Kheda - Gujarat",
  "Mahesana - Gujarat",
  "Morbi - Gujarat",
  "Nadiad - Gujarat",
  "Navsari - Gujarat",
  "Okha - Gujarat",
  "Palanpur - Gujarat",
  "Patan - Gujarat",
  "Porbandar - Gujarat",
  "Rajkot - Gujarat",
  "Surat - Gujarat",
  "Surendranagar - Gujarat",
  "Valsad - Gujarat",
  "Veraval - Gujarat",
  "Ambala - Haryana",
  "Bhiwani - Haryana",
  "Chandigarh - Haryana",
  "Faridabad - Haryana",
  "Firozpur Jhirka - Haryana",
  "Gurugram - Haryana",
  "Hansi - Haryana",
  "Hisar - Haryana",
  "Jind - Haryana",
  "Kaithal - Haryana",
  "Karnal - Haryana",
  "Kurukshetra - Haryana",
  "Panipat - Haryana",
  "Pehowa - Haryana",
  "Rewari - Haryana",
  "Rohtak - Haryana",
  "Sirsa - Haryana",
  "Sonipat - Haryana",
  "Bilaspur - Himachal Pradesh",
  "Chamba - Himachal Pradesh",
  "Dalhousie - Himachal Pradesh",
  "Dharmshala - Himachal Pradesh",
  "Hamirpur - Himachal Pradesh",
  "Kangra - Himachal Pradesh",
  "Kullu - Himachal Pradesh",
  "Mandi - Himachal Pradesh",
  "Nahan - Himachal Pradesh",
  "Shimla - Himachal Pradesh",
  "Una - Himachal Pradesh",
  "Anantnag - Jammu and Kashmir",
  "Baramula - Jammu and Kashmir",
  "Doda - Jammu and Kashmir",
  "Gulmarg - Jammu and Kashmir",
  "Jammu - Jammu and Kashmir",
  "Kathua - Jammu and Kashmir",
  "Punch - Jammu and Kashmir",
  "Rajouri - Jammu and Kashmir",
  "Srinagar - Jammu and Kashmir",
  "Udhampur - Jammu and Kashmir",
  "Bokaro - Jharkhand",
  "Chaibasa - Jharkhand",
  "Deoghar - Jharkhand",
  "Dhanbad - Jharkhand",
  "Dumka - Jharkhand",
  "Giridih - Jharkhand",
  "Hazaribag - Jharkhand",
  "Jamshedpur - Jharkhand",
  "Jharia - Jharkhand",
  "Rajmahal - Jharkhand",
  "Ranchi - Jharkhand",
  "Saraikela - Jharkhand",
  "Badami - Karnataka",
  "Ballari - Karnataka",
  "Bengaluru - Karnataka",
  "Belagavi - Karnataka",
  "Bhadravati - Karnataka",
  "Bidar - Karnataka",
  "Chikkamagaluru - Karnataka",
  "Chitradurga - Karnataka",
  "Davangere - Karnataka",
  "Halebidu - Karnataka",
  "Hassan - Karnataka",
  "Hubballi-Dharwad - Karnataka",
  "Kalaburagi - Karnataka",
  "Kolar - Karnataka",
  "Madikeri - Karnataka",
  "Mandya - Karnataka",
  "Mangaluru - Karnataka",
  "Mysuru - Karnataka",
  "Raichur - Karnataka",
  "Shivamogga / Shimoga - Karnataka",
  "Shravanabelagola - Karnataka",
  "Shrirangapattana - Karnataka",
  "Tumakuru - Karnataka",
  "Vijayapura - Karnataka",
  "Alappuzha - Kerala",
  "Vatakara - Kerala",
  "Idukki - Kerala",
  "Kannur - Kerala",
  "Kochi - Kerala",
  "Kollam - Kerala",
  "Kottayam - Kerala",
  "Kozhikode - Kerala",
  "Mattancheri - Kerala",
  "Palakkad - Kerala",
  "Thalassery - Kerala",
  "Thiruvananthapuram - Kerala",
  "Thrissur - Kerala",
  "Kargil - Ladakh",
  "Leh - Ladakh",
  "Balaghat - Madhya Pradesh",
  "Barwani - Madhya Pradesh",
  "Betul - Madhya Pradesh",
  "Bharhut - Madhya Pradesh",
  "Bhind - Madhya Pradesh",
  "Bhojpur - Madhya Pradesh",
  "Bhopal - Madhya Pradesh",
  "Burhanpur - Madhya Pradesh",
  "Chhatarpur - Madhya Pradesh",
  "Chhindwara - Madhya Pradesh",
  "Damoh - Madhya Pradesh",
  "Datia - Madhya Pradesh",
  "Dewas - Madhya Pradesh",
  "Dhar - Madhya Pradesh",
  "Dr. Ambedkar Nagar (Mhow) - Madhya Pradesh",
  "Guna - Madhya Pradesh",
  "Gwalior - Madhya Pradesh",
  "Hoshangabad - Madhya Pradesh",
  "Indore - Madhya Pradesh",
  "Itarsi - Madhya Pradesh",
  "Jabalpur - Madhya Pradesh",
  "Jhabua - Madhya Pradesh",
  "Khajuraho - Madhya Pradesh",
  "Khandwa - Madhya Pradesh",
  "Khargone - Madhya Pradesh",
  "Maheshwar - Madhya Pradesh",
  "Mandla - Madhya Pradesh",
  "Mandsaur - Madhya Pradesh",
  "Morena - Madhya Pradesh",
  "Murwara - Madhya Pradesh",
  "Narsimhapur - Madhya Pradesh",
  "Narsinghgarh - Madhya Pradesh",
  "Narwar - Madhya Pradesh",
  "Neemuch - Madhya Pradesh",
  "Nowgong - Madhya Pradesh",
  "Orchha - Madhya Pradesh",
  "Panna - Madhya Pradesh",
  "Raisen - Madhya Pradesh",
  "Rajgarh - Madhya Pradesh",
  "Ratlam - Madhya Pradesh",
  "Rewa - Madhya Pradesh",
  "Sagar - Madhya Pradesh",
  "Sarangpur - Madhya Pradesh",
  "Satna - Madhya Pradesh",
  "Sehore - Madhya Pradesh",
  "Seoni - Madhya Pradesh",
  "Shahdol - Madhya Pradesh",
  "Shajapur - Madhya Pradesh",
  "Sheopur - Madhya Pradesh",
  "Shivpuri - Madhya Pradesh",
  "Ujjain - Madhya Pradesh",
  "Vidisha - Madhya Pradesh",
  "Ahmadnagar - Maharashtra",
  "Akola - Maharashtra",
  "Amravati - Maharashtra",
  "Aurangabad - Maharashtra",
  "Bhandara - Maharashtra",
  "Bhusawal - Maharashtra",
  "Bid - Maharashtra",
  "Buldhana - Maharashtra",
  "Chandrapur - Maharashtra",
  "Daulatabad - Maharashtra",
  "Dhule - Maharashtra",
  "Jalgaon - Maharashtra",
  "Kalyan - Maharashtra",
  "Karli - Maharashtra",
  "Kolhapur - Maharashtra",
  "Mahabaleshwar - Maharashtra",
  "Malegaon - Maharashtra",
  "Matheran - Maharashtra",
  "Mumbai - Maharashtra",
  "Nagpur - Maharashtra",
  "Nanded - Maharashtra",
  "Nashik - Maharashtra",
  "Osmanabad - Maharashtra",
  "Pandharpur - Maharashtra",
  "Parbhani - Maharashtra",
  "Pune - Maharashtra",
  "Ratnagiri - Maharashtra",
  "Sangli - Maharashtra",
  "Satara - Maharashtra",
  "Sevagram - Maharashtra",
  "Solapur - Maharashtra",
  "Thane - Maharashtra",
  "Ulhasnagar - Maharashtra",
  "Vasai-Virar - Maharashtra",
  "Wardha - Maharashtra",
  "Yavatmal - Maharashtra",
  "Imphal - Manipur",
  "Cherrapunji - Meghalaya",
  "Shillong - Meghalaya",
  "Aizawl - Mizoram",
  "Lunglei - Mizoram",
  "Kohima - Nagaland",
  "Mon - Nagaland",
  "Phek - Nagaland",
  "Wokha - Nagaland",
  "Zunheboto - Nagaland",
  "Balangir - Odisha",
  "Baleshwar - Odisha",
  "Baripada - Odisha",
  "Bhubaneshwar - Odisha",
  "Brahmapur - Odisha",
  "Cuttack - Odisha",
  "Dhenkanal - Odisha",
  "Kendujhar - Odisha",
  "Konark - Odisha",
  "Koraput - Odisha",
  "Paradip - Odisha",
  "Phulabani - Odisha",
  "Puri - Odisha",
  "Sambalpur - Odisha",
  "Udayagiri - Odisha",
  "Karaikal - Puducherry",
  "Mahe - Puducherry",
  "Puducherry - Puducherry",
  "Yanam - Puducherry",
  "Amritsar - Punjab",
  "Batala - Punjab",
  "Chandigarh - Punjab",
  "Faridkot - Punjab",
  "Firozpur - Punjab",
  "Gurdaspur - Punjab",
  "Hoshiarpur - Punjab",
  "Jalandhar - Punjab",
  "Kapurthala - Punjab",
  "Ludhiana - Punjab",
  "Nabha - Punjab",
  "Patiala - Punjab",
  "Rupnagar - Punjab",
  "Sangrur - Punjab",
  "Abu - Rajasthan",
  "Ajmer - Rajasthan",
  "Alwar - Rajasthan",
  "Amer - Rajasthan",
  "Barmer - Rajasthan",
  "Beawar - Rajasthan",
  "Bharatpur - Rajasthan",
  "Bhilwara - Rajasthan",
  "Bikaner - Rajasthan",
  "Bundi - Rajasthan",
  "Chittaurgarh - Rajasthan",
  "Churu - Rajasthan",
  "Dhaulpur - Rajasthan",
  "Dungarpur - Rajasthan",
  "Ganganagar - Rajasthan",
  "Hanumangarh - Rajasthan",
  "Jaipur - Rajasthan",
  "Jaisalmer - Rajasthan",
  "Jalor - Rajasthan",
  "Jhalawar - Rajasthan",
  "Jhunjhunu - Rajasthan",
  "Jodhpur - Rajasthan",
  "Kishangarh - Rajasthan",
  "Kota - Rajasthan",
  "Merta - Rajasthan",
  "Nagaur - Rajasthan",
  "Nathdwara - Rajasthan",
  "Pali - Rajasthan",
  "Phalodi - Rajasthan",
  "Pushkar - Rajasthan",
  "Sawai Madhopur - Rajasthan",
  "Shahpura - Rajasthan",
  "Sikar - Rajasthan",
  "Sirohi - Rajasthan",
  "Tonk - Rajasthan",
  "Udaipur - Rajasthan",
  "Gangtok - Sikkim",
  "Gyalshing - Sikkim",
  "Lachung - Sikkim",
  "Mangan - Sikkim",
  "Arcot - Tamil Nadu",
  "Chengalpattu - Tamil Nadu",
  "Chennai - Tamil Nadu",
  "Chidambaram - Tamil Nadu",
  "Coimbatore - Tamil Nadu",
  "Cuddalore - Tamil Nadu",
  "Dharmapuri - Tamil Nadu",
  "Dindigul - Tamil Nadu",
  "Erode - Tamil Nadu",
  "Kanchipuram - Tamil Nadu",
  "Kanniyakumari - Tamil Nadu",
  "Kodaikanal - Tamil Nadu",
  "Kumbakonam - Tamil Nadu",
  "Madurai - Tamil Nadu",
  "Mamallapuram - Tamil Nadu",
  "Nagappattinam - Tamil Nadu",
  "Nagercoil - Tamil Nadu",
  "Palayamkottai - Tamil Nadu",
  "Pudukkottai - Tamil Nadu",
  "Rajapalayam - Tamil Nadu",
  "Ramanathapuram - Tamil Nadu",
  "Salem - Tamil Nadu",
  "Thanjavur - Tamil Nadu",
  "Tiruchchirappalli - Tamil Nadu",
  "Tirunelveli - Tamil Nadu",
  "Tiruppur - Tamil Nadu",
  "Thoothukudi - Tamil Nadu",
  "Udhagamandalam - Tamil Nadu",
  "Vellore - Tamil Nadu",
  "Hyderabad - Telangana",
  "Karimnagar - Telangana",
  "Khammam - Telangana",
  "Mahbubnagar - Telangana",
  "Nizamabad - Telangana",
  "Sangareddi - Telangana",
  "Warangal - Telangana",
  "Agartala - Tripura",
  "Agra - Uttar Pradesh",
  "Aligarh - Uttar Pradesh",
  "Amroha - Uttar Pradesh",
  "Ayodhya - Uttar Pradesh",
  "Azamgarh - Uttar Pradesh",
  "Bahraich - Uttar Pradesh",
  "Ballia - Uttar Pradesh",
  "Banda - Uttar Pradesh",
  "Bara Banki - Uttar Pradesh",
  "Bareilly - Uttar Pradesh",
  "Basti - Uttar Pradesh",
  "Bijnor - Uttar Pradesh",
  "Bithur - Uttar Pradesh",
  "Budaun - Uttar Pradesh",
  "Bulandshahr - Uttar Pradesh",
  "Deoria - Uttar Pradesh",
  "Etah - Uttar Pradesh",
  "Etawah - Uttar Pradesh",
  "Faizabad - Uttar Pradesh",
  "Farrukhabad-cum-Fatehgarh - Uttar Pradesh",
  "Fatehpur - Uttar Pradesh",
  "Fatehpur Sikri - Uttar Pradesh",
  "Ghaziabad - Uttar Pradesh",
  "Ghazipur - Uttar Pradesh",
  "Gonda - Uttar Pradesh",
  "Gorakhpur - Uttar Pradesh",
  "Hamirpur - Uttar Pradesh",
  "Hardoi - Uttar Pradesh",
  "Hathras - Uttar Pradesh",
  "Jalaun - Uttar Pradesh",
  "Jaunpur - Uttar Pradesh",
  "Jhansi - Uttar Pradesh",
  "Kannauj - Uttar Pradesh",
  "Kanpur - Uttar Pradesh",
  "Lakhimpur - Uttar Pradesh",
  "Lalitpur - Uttar Pradesh",
  "Lucknow - Uttar Pradesh",
  "Mainpuri - Uttar Pradesh",
  "Mathura - Uttar Pradesh",
  "Meerut - Uttar Pradesh",
  "Mirzapur-Vindhyachal - Uttar Pradesh",
  "Moradabad - Uttar Pradesh",
  "Noida - Uttar Pradesh",
  "Muzaffarnagar - Uttar Pradesh",
  "Partapgarh - Uttar Pradesh",
  "Pilibhit - Uttar Pradesh",
  "Prayagraj - Uttar Pradesh",
  "Rae Bareli - Uttar Pradesh",
  "Rampur - Uttar Pradesh",
  "Saharanpur - Uttar Pradesh",
  "Sambhal - Uttar Pradesh",
  "Shahjahanpur - Uttar Pradesh",
  "Sitapur - Uttar Pradesh",
  "Sultanpur - Uttar Pradesh",
  "Tehri - Uttar Pradesh",
  "Varanasi - Uttar Pradesh",
  "Almora - Uttarakhand",
  "Dehra Dun - Uttarakhand",
  "Haridwar - Uttarakhand",
  "Mussoorie - Uttarakhand",
  "Nainital - Uttarakhand",
  "Pithoragarh - Uttarakhand",
  "Alipore - West Bengal",
  "Alipur Duar - West Bengal",
  "Asansol - West Bengal",
  "Baharampur - West Bengal",
  "Bally - West Bengal",
  "Balurghat - West Bengal",
  "Bankura - West Bengal",
  "Baranagar - West Bengal",
  "Barasat - West Bengal",
  "Barrackpore - West Bengal",
  "Basirhat - West Bengal",
  "Bhatpara - West Bengal",
  "Bishnupur - West Bengal",
  "Budge Budge - West Bengal",
  "Burdwan - West Bengal",
  "Chandernagore - West Bengal",
  "Darjeeling - West Bengal",
  "Diamond Harbour - West Bengal",
  "Dum Dum - West Bengal",
  "Durgapur - West Bengal",
  "Halisahar - West Bengal",
  "Haora - West Bengal",
  "Hugli - West Bengal",
  "Ingraj Bazar - West Bengal",
  "Jalpaiguri - West Bengal",
  "Kalimpong - West Bengal",
  "Kamarhati - West Bengal",
  "Kanchrapara - West Bengal",
  "Kharagpur - West Bengal",
  "Cooch Behar - West Bengal",
  "Kolkata - West Bengal",
  "Krishnanagar - West Bengal",
  "Malda - West Bengal",
  "Midnapore - West Bengal",
  "Murshidabad - West Bengal",
  "Nabadwip - West Bengal",
  "Palashi - West Bengal",
  "Panihati - West Bengal",
  "Purulia - West Bengal",
  "Raiganj - West Bengal",
  "Santipur - West Bengal",
  "Shantiniketan - West Bengal",
  "Shrirampur - West Bengal",
  "Siliguri - West Bengal",
  "Siuri - West Bengal",
  "Tamluk - West Bengal",
  "Titagarh - West Bengal",
]

export default function EmployeeCompanyDetails({ formData, updateFormData }: CompanyDetailsFormProps) {
  const [errors, setErrors] = useState({
    companyName: "",
    companyLocation: "",
    companyIndustry: "",
    teamSize: "",
  })
  const [socialMediaInput, setSocialMediaInput] = useState("")
  const [locationSearchTerm, setLocationSearchTerm] = useState("")
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [filteredLocations, setFilteredLocations] = useState<string[]>([])
  const locationDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Filter locations based on search term
    if (locationSearchTerm) {
      const filtered = locations
        .filter((location) => location.toLowerCase().includes(locationSearchTerm.toLowerCase()))
        .slice(0, 10) // Limit to 10 results for better performance
      setFilteredLocations(filtered)
      setShowLocationDropdown(filtered.length > 0)
    } else {
      setFilteredLocations([])
      setShowLocationDropdown(false)
    }
  }, [locationSearchTerm])

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const validateField = (name: string, value: string) => {
    if (name === "companyName" || name === "companyLocation") {
      return !value ? `${name === "companyName" ? "Company name" : "Company location"} is required` : ""
    }
    if (name === "companyIndustry") {
      return !value ? "Industry is required" : ""
    }
    if (name === "teamSize") {
      return !value ? "Team size is required" : ""
    }
    return ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Validate field
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))

    updateFormData({ [name]: value })
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocationSearchTerm(value)

    // Also update the form data
    updateFormData({ companyLocation: value })

    // Validate field
    const error = validateField("companyLocation", value)
    setErrors((prev) => ({ ...prev, companyLocation: error }))
  }

  const handleLocationSelect = (location: string) => {
    updateFormData({ companyLocation: location })
    setLocationSearchTerm("")
    setShowLocationDropdown(false)

    // Clear any error
    setErrors((prev) => ({ ...prev, companyLocation: "" }))
  }

  const handleSelectChange = (name: string, value: string) => {
    // Validate field
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))

    updateFormData({ [name]: value })
  }

  const addSocialMediaLink = () => {
    if (socialMediaInput.trim() && formData.socialMediaLinks.length < 3) {
      updateFormData({
        socialMediaLinks: [...formData.socialMediaLinks, socialMediaInput.trim()],
      })
      setSocialMediaInput("")
    }
  }

  const removeSocialMediaLink = (index: number) => {
    const updatedLinks = [...formData.socialMediaLinks]
    updatedLinks.splice(index, 1)
    updateFormData({ socialMediaLinks: updatedLinks })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">
          Company Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="companyName"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          required
          className={errors.companyName ? "border-red-500" : ""}
        />
        {errors.companyName && <p className="text-sm text-red-500">{errors.companyName}</p>}
      </div>

      <div className="space-y-2 relative">
        <Label htmlFor="companyLocation">
          Company Headquarters <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="companyLocation"
            name="companyLocation"
            value={formData.companyLocation}
            onChange={handleLocationChange}
            onFocus={() => {
              if (filteredLocations.length > 0) {
                setShowLocationDropdown(true)
              }
            }}
            placeholder="Search city, state..."
            required
            className={errors.companyLocation ? "border-red-500" : ""}
          />
          <Search className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
        </div>
        {showLocationDropdown && (
          <div
            ref={locationDropdownRef}
            className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredLocations.map((location, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm"
                onClick={() => handleLocationSelect(location)}
              >
                {location}
              </div>
            ))}
          </div>
        )}
        {errors.companyLocation && <p className="text-sm text-red-500">{errors.companyLocation}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyIndustry">
            Industry <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.companyIndustry}
            onValueChange={(value) => handleSelectChange("companyIndustry", value)}
          >
            <SelectTrigger id="companyIndustry" className={errors.companyIndustry ? "border-red-500" : ""}>
              <SelectValue placeholder="Select industry">{formData.companyIndustry || "Select industry"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companyIndustry && <p className="text-sm text-red-500">{errors.companyIndustry}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamSize">
            Team Size <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.teamSize} onValueChange={(value) => handleSelectChange("teamSize", value)}>
            <SelectTrigger id="teamSize" className={errors.teamSize ? "border-red-500" : ""}>
              <SelectValue placeholder="Select team size">{formData.teamSize || "Select team size"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {teamSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.teamSize && <p className="text-sm text-red-500">{errors.teamSize}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="aboutCompany">About Company</Label>
        <Textarea
          id="aboutCompany"
          name="aboutCompany"
          value={formData.aboutCompany}
          onChange={handleChange}
          placeholder="Brief description about your company"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyWebsite">Company Website</Label>
        <Input
          id="companyWebsite"
          name="companyWebsite"
          value={formData.companyWebsite}
          onChange={handleChange}
          placeholder="https://www.example.com"
        />
      </div>

      <div className="space-y-2">
        <Label>Company Social Media Links (Max 3)</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.socialMediaLinks.map((link, index) => (
            <div key={index} className="flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-md">
              <span className="text-sm">{link}</span>
              <button
                type="button"
                onClick={() => removeSocialMediaLink(index)}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            value={socialMediaInput}
            onChange={(e) => setSocialMediaInput(e.target.value)}
            placeholder="https://twitter.com/company"
            disabled={formData.socialMediaLinks.length >= 3}
          />
          <Button
            type="button"
            onClick={addSocialMediaLink}
            disabled={!socialMediaInput.trim() || formData.socialMediaLinks.length >= 3}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.socialMediaLinks.length >= 3 && (
          <p className="text-sm text-amber-600">Maximum 3 social media links allowed</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyLinkedin">Company LinkedIn Page</Label>
        <Input
          id="companyLinkedin"
          name="companyLinkedin"
          value={formData.companyLinkedin}
          onChange={handleChange}
          placeholder="https://linkedin.com/company/your-company"
        />
      </div>
    </div>
  )
}
