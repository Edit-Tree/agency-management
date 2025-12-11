'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createContract } from "@/app/actions/contracts"
import { generateContractContent } from "@/app/actions/ai"
import { ClientProfile, User, Project } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Wand2, FileText } from "lucide-react"
import { toast } from "sonner"

interface SerializedProject extends Omit<Project, 'budget' | 'createdAt' | 'updatedAt' | 'startDate' | 'endDate'> {
    budget: number | null
    createdAt: string | Date
    updatedAt: string | Date
    startDate: string | Date
    endDate: string | Date | null
}

interface CreateContractFormProps {
    clients: (ClientProfile & { user: User })[]
    projects: SerializedProject[]
}

const TEMPLATES = {
    STANDARD: `<h2>Service Agreement</h2><p>This Agreement is made between [Client Name] and [Your Company].</p><h3>1. Scope of Work</h3><p>The Service Provider agrees to perform the following services...</p><h3>2. Payment Terms</h3><p>Payment shall be made within 14 days of invoice.</p>`,
    RETAINER: `<h2>Retainer Agreement</h2><p>This Retainer Agreement is effective as of [Date]...</p><h3>1. Services</h3><p>Client engages Provider to provide ongoing services...</p><h3>2. Retainer Fee</h3><p>Client agrees to pay a monthly retainer fee of...</p>`,
    NDA: `<h2>Non-Disclosure Agreement</h2><p>This Non-Disclosure Agreement (the "Agreement") is entered into by...</p><h3>1. Confidential Information</h3><p>The parties agree to keep all proprietary information confidential...</p>`
}

export function CreateContractForm({ clients, projects }: CreateContractFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [selectedClientId, setSelectedClientId] = useState("")
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [template, setTemplate] = useState("")

    const filteredProjects = projects.filter(p => p.clientId === selectedClientId)

    const handleTemplateChange = (value: string) => {
        setTemplate(value)
        if (value && TEMPLATES[value as keyof typeof TEMPLATES]) {
            setContent(TEMPLATES[value as keyof typeof TEMPLATES])
        }
    }

    const handleAIGenerate = async () => {
        if (!title || !selectedClientId) {
            toast.error("Please enter a title and select a client first")
            return
        }

        setAiLoading(true)
        const client = clients.find(c => c.id === selectedClientId)
        const result = await generateContractContent(title, client?.companyName || "Client", template || "General")

        if (result.success && result.content) {
            setContent(result.content)
            toast.success("Contract content generated!")
        } else {
            toast.error(result.error || "Failed to generate content")
        }
        setAiLoading(false)
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.append('content', content)

        const result = await createContract(formData)

        if (result.success) {
            toast.success("Contract created successfully")
            router.push('/dashboard/contracts')
        } else {
            toast.error(result.error)
        }
        setLoading(false)
    }

    return (
        <form action={handleSubmit} className="space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Contract Details</CardTitle>
                    <div className="flex gap-2">
                        <Select value={template} onValueChange={handleTemplateChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Load Template" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="STANDARD">Standard Service</SelectItem>
                                <SelectItem value="RETAINER">Retainer</SelectItem>
                                <SelectItem value="NDA">NDA</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleAIGenerate}
                            disabled={aiLoading}
                        >
                            <Wand2 className="mr-2 h-4 w-4" />
                            {aiLoading ? "Generating..." : "Generate with AI"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Contract Title</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="e.g. Service Agreement"
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
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Contract Terms</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            name="content"
                            placeholder="Enter contract terms here..."
                            className="min-h-[400px] font-mono text-sm"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            You can use Markdown or HTML for formatting.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Contract"}
                </Button>
            </div>
        </form>
    )
}
