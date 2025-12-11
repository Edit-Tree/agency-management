import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trash2, UserPlus, Mail, Shield } from "lucide-react"
import Link from "next/link"
import { addClientTeamMember, removeClientTeamMember } from "@/app/actions/client-team"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default async function ClientTeamPage({ params }: { params: { id: string } }) {
    const client = await prisma.clientProfile.findUnique({
        where: { id: params.id },
        include: {
            user: true, // The primary owner
            teamMembers: {
                include: {
                    user: true
                }
            }
        }
    })

    if (!client) {
        notFound()
    }

    async function handleAddMember(formData: FormData) {
        'use server'
        await addClientTeamMember(params.id, formData)
    }

    async function handleRemoveMember(userId: string) {
        'use server'
        await removeClientTeamMember(params.id, userId)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/clients/${params.id}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                    <p className="text-muted-foreground">{client.companyName}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Add Member Form */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Add Team Member</CardTitle>
                        <CardDescription>Invite a new member to this client account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={handleAddMember} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" required placeholder="John Doe" />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required placeholder="john@example.com" />
                            </div>
                            <div>
                                <Label htmlFor="password">Temporary Password</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <div>
                                <Label htmlFor="role">Role</Label>
                                <Select name="role" defaultValue="MEMBER">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MEMBER">Member</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Member
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Team List */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>Manage access for {client.companyName} team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Primary Owner */}
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {client.user.name?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {client.user.name}
                                            <Badge variant="default" className="text-[10px]">OWNER</Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {client.user.email}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Other Members */}
                            {client.teamMembers.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No additional team members yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {client.teamMembers.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarFallback>
                                                        {member.user.name?.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium flex items-center gap-2">
                                                        {member.user.name}
                                                        <Badge variant="outline" className="text-[10px]">{member.role}</Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {member.user.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <form action={handleRemoveMember.bind(null, member.userId)}>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
