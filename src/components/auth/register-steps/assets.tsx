"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { FormData } from "../register-form"

interface AssetsFormProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
}

export default function AssetsForm({ formData, updateFormData }: AssetsFormProps) {
  const handleAssetChange = (field: string, value: boolean | string) => {
    updateFormData({
      assets: {
        ...formData.assets,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Available Assets</h3>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="bike"
            checked={formData.assets.bike}
            onCheckedChange={(checked) => handleAssetChange("bike", checked === true)}
          />
          <Label htmlFor="bike" className="font-normal">
            Bike / Car
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="wifi"
            checked={formData.assets.wifi}
            onCheckedChange={(checked) => handleAssetChange("wifi", checked === true)}
          />
          <Label htmlFor="wifi" className="font-normal">
            WiFi
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="laptop"
            checked={formData.assets.laptop}
            onCheckedChange={(checked) => handleAssetChange("laptop", checked === true)}
          />
          <Label htmlFor="laptop" className="font-normal">
            Laptop
          </Label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Identity Documents</h3>

        <div className="flex items-center space-x-2">
        <Checkbox
            id="panCard"
            checked={formData.assets.panCard}
            onCheckedChange={(checked) => handleAssetChange("panCard", checked === true)}
          />
          <Label htmlFor="panCard" className="font-normal">
            Pan Card
          </Label>
        </div>
        <div className="flex items-center space-x-2">
        <Checkbox
            id="aadhar"
            checked={formData.assets.aadhar}
            onCheckedChange={(checked) => handleAssetChange("aadhar", checked === true)}
          />
          <Label htmlFor="aadhar" className="font-normal">
           Aadhar
          </Label>
        </div>
        <div className="flex items-center space-x-2">
        <Checkbox
            id="bankaccount"
            checked={formData.assets.bankAccount}
            onCheckedChange={(checked) => handleAssetChange("bankAccount", checked === true)}
          />
          <Label htmlFor="bankAccount" className="font-normal">
            Bank Account
          </Label>
        </div>
        <div className="flex items-center space-x-2">
        <Checkbox
            id="idProof"
            checked={formData.assets.idProof}
            onCheckedChange={(checked) => handleAssetChange("idProof", checked === true)}
          />
          <Label htmlFor="idProof" className="font-normal">
          Voter ID / Passport / DL (Any)
          </Label>
        </div>
      </div>
    </div>
  )
}
