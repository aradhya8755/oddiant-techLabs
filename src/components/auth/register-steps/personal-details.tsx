"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { FormData } from "../register-form"

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

// Create a map of city to state for quick lookup
const cityToStateMap = new Map()
allCities.forEach((item) => {
  cityToStateMap.set(item.city, item.state)
})

interface PersonalDetailsFormProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
}

export default function PersonalDetailsForm({ formData, updateFormData }: PersonalDetailsFormProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCities, setFilteredCities] = useState(allCities)

  useEffect(() => {
    if (searchTerm) {
      const filtered = allCities.filter(
        (item) =>
          item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.state.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredCities(filtered)
    } else {
      setFilteredCities(allCities)
    }
  }, [searchTerm])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    updateFormData({ [name]: value })
  }

  const handleCitySelect = (city: string) => {
    const state = cityToStateMap.get(city) || ""
    updateFormData({
      currentCity: city,
      currentState: state.replace(/ $$union territory$$| $$national capital territory$$/g, ""),
    })
    setSearchTerm("")
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="salutation">Salutation</Label>
        <Select value={formData.salutation} onValueChange={(value) => handleSelectChange("salutation", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select salutation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Mr.">Mr.</SelectItem>
            <SelectItem value="Mrs.">Mrs.</SelectItem>
            <SelectItem value="Ms.">Ms.</SelectItem>
            <SelectItem value="Dr.">Dr.</SelectItem>
            <SelectItem value="Prof.">Prof.</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input id="middleName" name="middleName" value={formData.middleName} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone <span className="text-red-500">*</span>
          </Label>
          <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alternativePhone">Alternative Phone</Label>
          <Input
            id="alternativePhone"
            name="alternativePhone"
            type="tel"
            value={formData.alternativePhone}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dob">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">
            Gender <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formData.gender}
            onValueChange={(value) => handleSelectChange("gender", value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentCity">
            Current City <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="currentCity"
              name="currentCity"
              placeholder="Search for a city..."
              value={searchTerm || formData.currentCity}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (e.target.value === "") {
                  updateFormData({ currentCity: "", currentState: "" })
                }
              }}
              required
            />
            {searchTerm && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredCities.length > 0 ? (
                  filteredCities.slice(0, 10).map((item) => (
                    <div
                      key={`${item.state}-${item.city}`}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleCitySelect(item.city)}
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentState">
            Current State <span className="text-red-500">*</span>
          </Label>
          <Input id="currentState" name="currentState" value={formData.currentState} onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pincode">
          Pincode <span className="text-red-500">*</span>
        </Label>
        <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profileOutline">Profile Outline</Label>
        <Textarea
          id="profileOutline"
          name="profileOutline"
          value={formData.profileOutline}
          onChange={handleChange}
          rows={4}
          placeholder="Brief description about yourself"
        />
      </div>
    </div>
  )
}
