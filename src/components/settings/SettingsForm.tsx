"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export function SettingsForm() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        businessName: "",
        address: "",
        mobile: "",
        gst: "",
        terms: "",
    })

    useEffect(() => {
        fetch("/api/settings")
            .then((res) => res.json())
            .then((data) => {
                setSettings((prev) => ({ ...prev, ...data }))
                setLoading(false)
            })
            .catch(() => {
                toast.error("Failed to load settings")
                setLoading(false)
            })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })
            if (!res.ok) throw new Error("Failed to save")
            toast.success("Settings saved successfully")
        } catch (error) {
            toast.error("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div>Loading settings...</div>

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Business Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                            id="businessName"
                            value={settings.businessName}
                            onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                            placeholder="RKM Loom Spares"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            value={settings.address}
                            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                            placeholder="Enter full address"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input
                                id="mobile"
                                value={settings.mobile}
                                onChange={(e) => setSettings({ ...settings, mobile: e.target.value })}
                                placeholder="9043065470"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gst">GST Number</Label>
                            <Input
                                id="gst"
                                value={settings.gst}
                                onChange={(e) => setSettings({ ...settings, gst: e.target.value })}
                                placeholder="GSTIN..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="terms">Invoice Terms & Conditions</Label>
                        <Textarea
                            id="terms"
                            value={settings.terms}
                            onChange={(e) => setSettings({ ...settings, terms: e.target.value })}
                            placeholder="Goods once sold cannot be returned..."
                        />
                    </div>

                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Settings"}
                    </Button>
                </CardContent>
            </Card>
        </form>
    )
}
