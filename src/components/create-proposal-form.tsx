'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Wand2 } from "lucide-react"
import { createProposal } from "@/app/actions/proposals"
import { generateProposalContent } from "@/app/actions/ai"
import { ClientProfile, User, Project } from "@prisma/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SerializedProject extends Omit<Project, 'budget' | 'createdAt' | 'updatedAt' | 'startDate' | 'endDate'> {
    budget: number | null
    createdAt: string | Date
    updatedAt: string | Date
    startDate: string | Date
    endDate: string | Date | null
}

interface CreateProposalFormProps {
    clients: (ClientProfile & { user: User })[]
    projects: SerializedProject[]
}

interface ProposalItem {
    description: string
    amount: number
}

export function CreateProposalForm({ clients, projects }: CreateProposalFormProps) {
    const router = useRouter()
    const [items, setItems] = useState<ProposalItem[]>([{ description: "", amount: 0 }])
    const [scope, setScope] = useState("")
    const [currency, setCurrency] = useState("USD")
    const [loading, setLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [selectedClientId, setSelectedClientId] = useState("")
    const [title, setTitle] = useState("")

    const addItem = () => {
        setItems([...items, { description: "", amount: 0 }])
    }

    const removeItem = (index: number) => {
        const newItems = [...items]
        newItems.splice(index, 1)
        setItems(newItems)
    }

    const updateItem = (index: number, field: keyof ProposalItem, value: string | number) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

    const filteredProjects = projects.filter(p => p.clientId === selectedClientId)

    const handleAIGenerate = async () => {
        if (!title || !selectedClientId) {
            toast.error("Please enter a title and select a client first")
            return
        }

        setAiLoading(true)
        const client = clients.find(c => c.id === selectedClientId)
        const result = await generateProposalContent(title, client?.companyName || "Client")

        if (result.success && result.data) {
            setScope(result.data.scope)
            setItems(result.data.items)
            toast.success("Proposal content generated!")
        } else {
            toast.error(result.error || "Failed to generate content")
        }
        setAiLoading(false)
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.append('content', JSON.stringify({ scope, items }))
        formData.append('totalAmount', totalAmount.toString())
        formData.append('currency', currency)

        const result = await createProposal(formData)

        if (result.success) {
            toast.success("Proposal created successfully")
            router.push('/dashboard/proposals')
        } else {
            toast.error(result.error)
        }
        setLoading(false)
    }

    return (
        <form action={handleSubmit} className="space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Proposal Details</CardTitle>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAIGenerate}
                        disabled={aiLoading}
                    >
                        <Wand2 className="mr-2 h-4 w-4" />
                        {aiLoading ? "Generating..." : "Auto-Fill with AI"}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Proposal Title</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="e.g. Marketing Strategy Proposal"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="clientId">Client</Label>
                            <Select name="clientId" onValueChange={setSelectedClientId} required>
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
                        <div className="space-y-2">
                            <Label htmlFor="projectId">Project (Optional)</Label>
                            <Select name="projectId" disabled={!selectedClientId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredProjects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                    <SelectItem value="INR">INR (₹)</SelectItem>
                                    <SelectItem value="AUD">AUD ($)</SelectItem>
                                    <SelectItem value="CAD">CAD ($)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="validUntil">Valid Until</Label>
                            <Input id="validUntil" name="validUntil" type="date" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Scope of Work</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Detailed description of the services..."
                        rows={6}
                        value={scope}
                        onChange={(e) => setScope(e.target.value)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Pricing & Deliverables</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-4 items-start">
                            <div className="flex-1 space-y-2">
                                <Input
                                    placeholder="Item description"
                                    value={item.description}
                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="w-32 space-y-2">
                                <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={item.amount}
                                    onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value))}
                                    required
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={items.length === 1}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                    <div className="text-right font-semibold text-lg">
                        Total: {totalAmount.toFixed(2)} {currency}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Proposal"}
                </Button>
            </div>
        </form>
    )
}
