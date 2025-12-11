import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar } from "lucide-react"
import { format } from "date-fns"
import { Project, ClientProfile } from "@prisma/client"

interface ProjectCardProps {
    project: Project & {
        client: ClientProfile
        _count: {
            tickets: number
        }
    }
    href?: string
}

// Status color mapping
const statusColors = {
    ACTIVE: {
        border: "border-l-4 border-l-green-500",
        badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        dot: "bg-green-500"
    },
    IN_PROGRESS: {
        border: "border-l-4 border-l-blue-500",
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        dot: "bg-blue-500"
    },
    ON_HOLD: {
        border: "border-l-4 border-l-yellow-500",
        badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        dot: "bg-yellow-500"
    },
    COMPLETED: {
        border: "border-l-4 border-l-gray-400",
        badge: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        dot: "bg-gray-400"
    }
}

export function ProjectCard({ project, href }: ProjectCardProps) {
    const linkHref = href || `/dashboard/projects/${project.id}`
    const colors = statusColors[project.status as keyof typeof statusColors] || statusColors.ACTIVE

    return (
        <Link href={linkHref}>
            <Card className={`hover:shadow-lg transition-all cursor-pointer ${colors.border}`}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl truncate">{project.title}</CardTitle>
                        <Badge className={colors.badge}>
                            <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${colors.dot}`}></span>
                            {project.status.replace('_', ' ')}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.client.companyName}</p>
                </CardHeader>
                <CardContent className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                        {project.description || "No description provided."}
                    </p>
                    <div className="mt-4 flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                    <div className="text-sm font-medium">
                        {project._count.tickets} Tickets
                    </div>
                    <Button asChild size="sm" variant="outline">
                        <div className="flex items-center">
                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    )
}
