import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Plus, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient, updateClient } from "@/app/actions/clients"
import Link from "next/link"

export default async function ClientsPage() {
    const clients = await prisma.clientProfile.findMany({
        include: {
            user: true,
            _count: {
                select: { projects: true, invoices: true }
            }
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Client
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Client</DialogTitle>
                        </DialogHeader>
                        <form action={async (formData) => {
                            'use server'
                            void await createClient(formData)
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Contact Name</Label>
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
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input id="companyName" name="companyName" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="billingAddress">Billing Address</Label>
                                <Input id="billingAddress" name="billingAddress" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gstNumber">GST Number</Label>
                                <Input id="gstNumber" name="gstNumber" placeholder="e.g. 29ABCDE1234F1Z5" />
                            </div>
                            <Button type="submit" className="w-full">Create Client</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {clients.map((client) => (
                    <Card key={client.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-4">
                                <Link href={`/dashboard/clients/${client.id}`}>
                                    <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                                        <AvatarFallback>{client.companyName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <CardTitle className="text-lg hover:underline">
                                        <Link href={`/dashboard/clients/${client.id}`}>
                                            {client.companyName}
                                        </Link>
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">{client.user.email}</p>
                                </div>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Client</DialogTitle>
                                    </DialogHeader>
                                    <form action={async (formData) => {
                                        'use server'
                                        void await updateClient(client.id, formData)
                                    }} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Contact Name</Label>
                                            <Input id="name" name="name" defaultValue={client.user.name || ''} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" name="email" type="email" defaultValue={client.user.email} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="companyName">Company Name</Label>
                                            <Input id="companyName" name="companyName" defaultValue={client.companyName} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="billingAddress">Billing Address</Label>
                                            <Input id="billingAddress" name="billingAddress" defaultValue={client.billingAddress || ''} />
                                        </div>
                                        <Button type="submit" className="w-full">Update Client</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between text-sm mt-4">
                                <div>
                                    <span className="font-medium">{client._count.projects}</span> Projects
                                </div>
                                <div>
                                    <span className="font-medium">{client._count.invoices}</span> Invoices
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
