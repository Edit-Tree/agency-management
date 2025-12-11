'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react"
import { createProject } from "@/app/actions/projects"
import { ClientProfile, User } from "@prisma/client"

interface CreateProjectFormProps {
    clients: (ClientProfile & { user: User })[]
}

interface ServiceItem {
    description: string
    price: number
}

export function CreateProjectForm({ clients }: CreateProjectFormProps) {
    const [services, setServices] = useState<ServiceItem[]>([{ description: "", price: 0 }])
    const [billingType, setBillingType] = useState("FIXED")
    const [loading, setLoading] = useState(false)

    const addService = () => {
        setServices([...services, { description: "", price: 0 }])
    }

    const removeService = (index: number) => {
        const newServices = [...services]
        newServices.splice(index, 1)
        setServices(newServices)
    }

    const updateService = (index: number, field: keyof ServiceItem, value: string | number) => {
        const newServices = [...services]
        newServices[index] = { ...newServices[index], [field]: value }
        setServices(newServices)
    }

    const totalBudget = services.reduce((sum, item) => sum + (Number(item.price) || 0), 0)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        // Append complex data
        formData.append('services', JSON.stringify(services))
        formData.append('billingType', billingType)
        // If fixed, budget is sum of services. If not, it might be manual.
        // For now, let's default budget to total of services if fixed.
        if (billingType === 'FIXED') {
            formData.set('budget', totalBudget.toString())
        }

        await createProject(formData)
        setLoading(false)
    }

    return (
        <form action={handleSubmit} className="space-y-8">
            {/* Project Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Project Title</Label>
                            <Input id="title" name="title" placeholder="e.g. Website Redesign" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clientId">Client</Label>
                            <Select name="clientId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.companyName} ({client.user.name})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Project details..." />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input id="startDate" name="startDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date (Optional)</Label>
                            <Input id="endDate" name="endDate" type="date" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Services */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Services & Deliverables</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addService}>
                        <Plus className="mr-2 h-4 w-4" /> Add Service
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {services.map((service, index) => (
                        <div key={index} className="flex gap-4 items-start">
                            <div className="flex-1 space-y-2">
                                <Input
                                    placeholder="Service description"
                                    value={service.description}
                                    onChange={(e) => updateService(index, 'description', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="w-32 space-y-2">
                                <Input
                                    type="number"
                                    placeholder="Price"
                                    value={service.price}
                                    onChange={(e) => updateService(index, 'price', parseFloat(e.target.value))}
                                    required
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeService(index)} disabled={services.length === 1}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                    <div className="text-right font-semibold">
                        Total: {totalBudget.toFixed(2)}
                    </div>
                </CardContent>
            </Card>

            {/* Billing */}
            <Card>
                <CardHeader>
                    <CardTitle>Billing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Billing Type</Label>
                        <Select value={billingType} onValueChange={setBillingType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FIXED">Fixed Price</SelectItem>
                                <SelectItem value="HOURLY">Hourly Rate</SelectItem>
                                <SelectItem value="RETAINER">Monthly Retainer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {billingType !== 'FIXED' && (
                        <div className="space-y-2">
                            <Label htmlFor="budget">
                                {billingType === 'HOURLY' ? 'Hourly Rate' : 'Monthly Amount'}
                            </Label>
                            <Input id="budget" name="budget" type="number" step="0.01" />
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Project"}
                </Button>
            </div>
        </form>
    )
}
