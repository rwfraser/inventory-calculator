import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, UserPlus, UserMinus } from "lucide-react";
import type { IdentitySection } from "@shared/types/pipeline";

interface IdentityFormProps {
  identity: IdentitySection;
  onSave: (data: any) => void;
  isPending: boolean;
}

function SSNInput({ value, onChange, id, ...props }: {
  value: string;
  onChange: (v: string) => void;
  id: string;
  [key: string]: any;
}) {
  return (
    <Input
      id={id}
      type="text"
      className="font-mono"
      value={value}
      onChange={(e) => {
        let raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 9);
        if (raw.length > 5) raw = raw.slice(0, 3) + "-" + raw.slice(3, 5) + "-" + raw.slice(5);
        else if (raw.length > 3) raw = raw.slice(0, 3) + "-" + raw.slice(3);
        onChange(raw);
      }}
      placeholder="XXX-XX-XXXX"
      maxLength={11}
      {...props}
    />
  );
}

export default function IdentityForm({ identity, onSave, isPending }: IdentityFormProps) {
  const [firstName, setFirstName] = useState(identity.taxpayer.name.first_name || "");
  const [middleName, setMiddleName] = useState(identity.taxpayer.name.middle_name || "");
  const [lastName, setLastName] = useState(identity.taxpayer.name.last_name || "");
  const [ssn, setSSN] = useState(identity.taxpayer.ssn || "");

  const [showSpouse, setShowSpouse] = useState(!!identity.spouse);
  const [spouseFirst, setSpouseFirst] = useState(identity.spouse?.name.first_name || "");
  const [spouseMiddle, setSpouseMiddle] = useState(identity.spouse?.name.middle_name || "");
  const [spouseLast, setSpouseLast] = useState(identity.spouse?.name.last_name || "");
  const [spouseSSN, setSpouseSSN] = useState(identity.spouse?.ssn || "");

  const [address, setAddress] = useState(identity.address.address_raw || "");
  const [phone, setPhone] = useState(identity.phone || "");
  const [email, setEmail] = useState(identity.email || "");

  useEffect(() => {
    setFirstName(identity.taxpayer.name.first_name || "");
    setMiddleName(identity.taxpayer.name.middle_name || "");
    setLastName(identity.taxpayer.name.last_name || "");
    setSSN(identity.taxpayer.ssn || "");
    setShowSpouse(!!identity.spouse);
    setSpouseFirst(identity.spouse?.name.first_name || "");
    setSpouseMiddle(identity.spouse?.name.middle_name || "");
    setSpouseLast(identity.spouse?.name.last_name || "");
    setSpouseSSN(identity.spouse?.ssn || "");
    setAddress(identity.address.address_raw || "");
    setPhone(identity.phone || "");
    setEmail(identity.email || "");
  }, [identity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      taxpayer_first_name: firstName,
      taxpayer_middle_name: middleName || null,
      taxpayer_last_name: lastName,
      taxpayer_ssn: ssn || null,
      spouse_first_name: showSpouse ? spouseFirst || null : null,
      spouse_middle_name: showSpouse ? spouseMiddle || null : null,
      spouse_last_name: showSpouse ? spouseLast || null : null,
      spouse_ssn: showSpouse ? spouseSSN || null : null,
      address: address || null,
      phone: phone || null,
      email: email || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="identity-form">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Taxpayer Information</CardTitle>
          <CardDescription>Primary taxpayer name and Social Security number</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-5">
              <Label htmlFor="tp-first" className="text-xs">First Name</Label>
              <Input id="tp-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required data-testid="input-taxpayer-first" />
            </div>
            <div className="col-span-3">
              <Label htmlFor="tp-middle" className="text-xs">Middle Name</Label>
              <Input id="tp-middle" value={middleName} onChange={(e) => setMiddleName(e.target.value)} data-testid="input-taxpayer-middle" />
            </div>
            <div className="col-span-4">
              <Label htmlFor="tp-last" className="text-xs">Last Name</Label>
              <Input id="tp-last" value={lastName} onChange={(e) => setLastName(e.target.value)} required data-testid="input-taxpayer-last" />
            </div>
          </div>
          <div className="max-w-xs">
            <Label htmlFor="tp-ssn" className="text-xs">Social Security Number</Label>
            <SSNInput id="tp-ssn" value={ssn} onChange={setSSN} data-testid="input-taxpayer-ssn" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Spouse Information</CardTitle>
              <CardDescription>Optional — only if filing jointly</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowSpouse(!showSpouse);
                if (showSpouse) {
                  setSpouseFirst("");
                  setSpouseMiddle("");
                  setSpouseLast("");
                  setSpouseSSN("");
                }
              }}
              data-testid="button-toggle-spouse"
            >
              {showSpouse ? <UserMinus className="h-4 w-4 mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
              {showSpouse ? "Remove Spouse" : "Add Spouse"}
            </Button>
          </div>
        </CardHeader>
        {showSpouse && (
          <CardContent className="space-y-3">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <Label htmlFor="sp-first" className="text-xs">First Name</Label>
                <Input id="sp-first" value={spouseFirst} onChange={(e) => setSpouseFirst(e.target.value)} data-testid="input-spouse-first" />
              </div>
              <div className="col-span-3">
                <Label htmlFor="sp-middle" className="text-xs">Middle Name</Label>
                <Input id="sp-middle" value={spouseMiddle} onChange={(e) => setSpouseMiddle(e.target.value)} data-testid="input-spouse-middle" />
              </div>
              <div className="col-span-4">
                <Label htmlFor="sp-last" className="text-xs">Last Name</Label>
                <Input id="sp-last" value={spouseLast} onChange={(e) => setSpouseLast(e.target.value)} data-testid="input-spouse-last" />
              </div>
            </div>
            <div className="max-w-xs">
              <Label htmlFor="sp-ssn" className="text-xs">Social Security Number</Label>
              <SSNInput id="sp-ssn" value={spouseSSN} onChange={setSpouseSSN} data-testid="input-spouse-ssn" />
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Address & Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="address" className="text-xs">Mailing Address</Label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, State ZIP"
              className="w-full text-sm border rounded-md px-3 py-2 bg-background resize-none"
              rows={2}
              data-testid="input-address"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="phone" className="text-xs">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(208) 555-1234" data-testid="input-phone" />
            </div>
            <div>
              <Label htmlFor="contact-email" className="text-xs">Email</Label>
              <Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" data-testid="input-contact-email" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} data-testid="button-save-identity">
          {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Taxpayer Info
        </Button>
      </div>
    </form>
  );
}
