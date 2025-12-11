import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateProject } from "@/app/actions/projects"

interface EditProjectPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
    const { id } = await params

    const project = await prisma.project.findUnique({
        where: { id },
        include: { client: true }
    })

    if (!project) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Project</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={async (formData) => {
                        'use server'
                        await updateProject(id, formData)
                    }} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Project Title</Label>
                            <Input id="title" name="title" defaultValue={project.title} required />
                        </div>

                        <div className="space-y-2">
                            <Label>Client</Label>
                            <Input value={project.client.companyName} disabled className="bg-gray-100" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={project.description || ''} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="budget">Budget (USD)</Label>
                            <Input
                                id="budget"
                                name="budget"
                                type="number"
                                step="0.01"
                                defaultValue={project.budget ? Number(project.budget) : ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue={project.status}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="submit">Update Project</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
