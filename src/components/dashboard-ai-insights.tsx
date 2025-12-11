'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Target, TrendingUp } from "lucide-react"
import { generateDashboardInsights } from "@/app/actions/ai"

interface DashboardAIInsightsProps {
    currentRevenue: number
    currentProjects: number
}

export function DashboardAIInsights({ currentRevenue, currentProjects }: DashboardAIInsightsProps) {
    const [targetRevenue, setTargetRevenue] = useState('')
    const [targetProjects, setTargetProjects] = useState('')
    const [insights, setInsights] = useState<any>(null)
    const [isPending, startTransition] = useTransition()

    const handleGenerateInsights = async () => {
        if (!targetRevenue || !targetProjects) {
            alert('Please enter both revenue and project targets')
            return
        }

        startTransition(async () => {
            const result = await generateDashboardInsights(
                Number(targetRevenue),
                Number(targetProjects)
            )

            if (result.success) {
                setInsights(result)
            } else {
                alert(result.error || 'Failed to generate insights')
            }
        })
    }

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Growth Strategy
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Goal Input Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
                        <Label htmlFor="targetRevenue" className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Target Revenue (₹)
                        </Label>
                        <Input
                            id="targetRevenue"
                            type="number"
                            placeholder="50000"
                            value={targetRevenue}
                            onChange={(e) => setTargetRevenue(e.target.value)}
                            className="font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="targetProjects" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Target Active Projects
                        </Label>
                        <Input
                            id="targetProjects"
                            type="number"
                            placeholder="10"
                            value={targetProjects}
                            onChange={(e) => setTargetProjects(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <Button
                            onClick={handleGenerateInsights}
                            disabled={isPending}
                            className="w-full"
                        >
                            {isPending ? (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Strategy
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Current vs Target Stats */}
                {insights && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Revenue Progress */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="text-sm text-muted-foreground mb-1">Revenue Progress</div>
                                <div className="flex items-baseline gap-2">
                                    <div className="text-2xl font-bold">₹{insights.currentRevenue.toFixed(0)}</div>
                                    <div className="text-sm text-muted-foreground">/ ₹{targetRevenue}</div>
                                </div>
                                <div className="mt-2 h-2 bg-green-200 dark:bg-green-900 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 dark:bg-green-600 transition-all"
                                        style={{ width: `${Math.min((insights.currentRevenue / Number(targetRevenue)) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    Gap: ₹{insights.revenueGap > 0 ? insights.revenueGap.toFixed(0) : '0'} remaining
                                </div>
                            </div>

                            {/* Projects Progress */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="text-sm text-muted-foreground mb-1">Projects Progress</div>
                                <div className="flex items-baseline gap-2">
                                    <div className="text-2xl font-bold">{insights.currentProjects}</div>
                                    <div className="text-sm text-muted-foreground">/ {targetProjects}</div>
                                </div>
                                <div className="mt-2 h-2 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 dark:bg-blue-600 transition-all"
                                        style={{ width: `${Math.min((insights.currentProjects / Number(targetProjects)) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    Gap: {insights.projectsGap > 0 ? insights.projectsGap : '0'} more needed
                                </div>
                            </div>
                        </div>

                        {/* AI Insights */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold text-lg">AI Strategy Recommendations</h3>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <div
                                    className="text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: insights.insights
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/^- (.+)$/gm, '<li>$1</li>')
                                            .replace(/\n\n/g, '<br/><br/>')
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {!insights && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Set your monthly targets above and let AI create a personalized growth strategy for you.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
