import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createUser } from "@/app/actions/users"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: { clientProfile: true }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New User</DialogTitle>
                        </DialogHeader>
                        <form action={createUser} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select name="role" required defaultValue="TEAM">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="TEAM">Team Member</SelectItem>
                                        <SelectItem value="CLIENT">Client</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name (Clients Only)</Label>
                                <Input id="companyName" name="companyName" placeholder="Acme Corp" />
                            </div>
                            <Button type="submit" className="w-full">Create User</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'TEAM' ? 'default' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.clientProfile?.companyName || '-'}</TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm">Edit</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit User</DialogTitle>
                                                    </DialogHeader>
                                                    <form action={async (formData) => {
                                                        'use server'
                                                        const { updateUser } = await import("@/app/actions/users")
                                                        await updateUser(user.id, formData)
                                                    }} className="space-y-4 mt-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="name">Name</Label>
                                                            <Input id="name" name="name" defaultValue={user.name || ''} required />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="email">Email</Label>
                                                            <Input id="email" name="email" type="email" defaultValue={user.email} required />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="role">Role</Label>
                                                            <Select name="role" required defaultValue={user.role}>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                                                    <SelectItem value="TEAM">Team Member</SelectItem>
                                                                    <SelectItem value="CLIENT">Client</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        {user.role === 'CLIENT' && (
                                                            <div className="space-y-2">
                                                                <Label htmlFor="companyName">Company Name</Label>
                                                                <Input id="companyName" name="companyName" defaultValue={user.clientProfile?.companyName || ''} />
                                                            </div>
                                                        )}
                                                        <Button type="submit" className="w-full">Update User</Button>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>

                                            <form action={async () => {
                                                'use server'
                                                const { deleteUser } = await import("@/app/actions/users")
                                                await deleteUser(user.id)
                                            }}>
                                                <Button variant="destructive" size="sm" type="submit">Delete</Button>
                                            </form>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
