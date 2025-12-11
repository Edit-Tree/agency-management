'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateClient } from "@/app/actions/clients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClientProfile, User } from "@prisma/client"
import { toast } from "sonner"
import Link from "next/link"

interface EditClientFormProps {
    client: ClientProfile & { user: User }
}

export function EditClientForm({ client }: EditClientFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await updateClient(client.id, formData)
            if (result.success) {
                toast.success("Client updated successfully")
                router.push(`/dashboard/clients/${client.id}`)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update client")
            }
        })
    }

    return (
        <form action={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
                {/* Company Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="companyName">Company Name *</Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                defaultValue={client.companyName}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="contactName">Contact Name</Label>
                            <Input
                                id="contactName"
                                name="contactName"
                                defaultValue={client.contactName || ''}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">User Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={client.user.name || ''}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={client.user.email}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                defaultValue={client.phone || ''}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Address Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Address Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                defaultValue={client.address || ''}
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="billingAddress">Billing Address</Label>
                            <Textarea
                                id="billingAddress"
                                name="billingAddress"
                                defaultValue={client.billingAddress || ''}
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Tax Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tax Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="gstNumber">GST Number</Label>
                            <Input
                                id="gstNumber"
                                name="gstNumber"
                                defaultValue={client.gstNumber || ''}
                                placeholder="e.g., 29ABCDE1234F1Z5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="vatNumber">VAT Number</Label>
                            <Input
                                id="vatNumber"
                                name="vatNumber"
                                defaultValue={client.vatNumber || ''}
                            />
                        </div>
                        <div>
                            <Label htmlFor="taxId">Tax ID</Label>
                            <Input
                                id="taxId"
                                name="taxId"
                                defaultValue={client.taxId || ''}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Resources */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Client Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="knowledgeBaseUrl">Knowledge Base URL</Label>
                            <Input
                                id="knowledgeBaseUrl"
                                name="knowledgeBaseUrl"
                                type="url"
                                defaultValue={client.knowledgeBaseUrl || ''}
                                placeholder="https://docs.example.com"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Link to client's documentation or knowledge base
                            </p>
                        </div>
                        <div>
                            <Label htmlFor="brandingKitUrl">Branding Kit URL</Label>
                            <Input
                                id="brandingKitUrl"
                                name="brandingKitUrl"
                                type="url"
                                defaultValue={client.brandingKitUrl || ''}
                                placeholder="https://drive.google.com/..."
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Link to client's branding assets (logos, colors, fonts, etc.)
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" asChild>
                    <Link href={`/dashboard/clients/${client.id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    )
}
