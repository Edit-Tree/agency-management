'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Lightbulb } from "lucide-react"
import { generateProjectInsights } from "@/app/actions/ai"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ProjectAiInsightsProps {
    projectId: string
}

export function ProjectAiInsights({ projectId }: ProjectAiInsightsProps) {
    const [loading, setLoading] = useState(false)
    const [insights, setInsights] = useState<string | null>(null)

    const handleGenerateInsights = async () => {
        setLoading(true)
        const result = await generateProjectInsights(projectId)
        if (result.success && result.insights) {
            setInsights(result.insights)
        } else {
            alert(result.error || "Failed to generate insights")
        }
        setLoading(false)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={handleGenerateInsights}>
                    <Sparkles className="mr-2 h-4 w-4 text-purple-500" /> AI Insights
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" /> Project Insights
                    </DialogTitle>
                </DialogHeader>
                <div className="h-[400px] w-full rounded-md border p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                    {loading && !insights ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Analyzing project data...
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none">
                            <div className="whitespace-pre-wrap text-sm">
                                {insights}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
