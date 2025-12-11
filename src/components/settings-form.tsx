'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Copy, RefreshCw } from "lucide-react"


interface Settings {
    id?: string
    smtpHost?: string | null
    smtpPort?: number | null
    smtpUsername?: string | null
    smtpPassword?: string | null
    smtpFromEmail?: string | null
    smtpFromName?: string | null
    razorpayKeyId?: string | null
    razorpayKeySecret?: string | null
    enableInvoiceEmails?: boolean
    paymentReminderEnabled?: boolean
    paymentReminderMessage?: string | null
    emailOnTicketCreated?: boolean
    emailOnTicketAssigned?: boolean
    emailOnTicketStatusChange?: boolean
    emailOnReviewRequested?: boolean
    emailOnReviewApproved?: boolean
    emailOnCommentAdded?: boolean
    emailOnInvoiceCreated?: boolean
    emailOnInvoicePaid?: boolean
    emailOnDeadlineApproaching?: boolean
    emailOnProjectCreated?: boolean
    geminiApiKey?: string | null
    companyName?: string | null
    companyAddress?: string | null
    companyGst?: string | null
    companyEmail?: string | null
    companyPhone?: string | null
    companyWebsite?: string | null
}

interface SettingsFormProps {
    settings: Settings | null
    saveEmailSettings: (formData: FormData) => Promise<{ success: boolean }>
    savePaymentSettings: (formData: FormData) => Promise<{ success: boolean }>
    saveTemplateSettings: (formData: FormData) => Promise<{ success: boolean }>
    saveNotificationSettings: (formData: FormData) => Promise<{ success: boolean }>
    saveAiSettings: (formData: FormData) => Promise<{ success: boolean }>
    saveCompanySettings: (formData: FormData) => Promise<{ success: boolean }>
}

export function SettingsForm({
    settings,
    saveEmailSettings,
    savePaymentSettings,
    saveTemplateSettings,
    saveNotificationSettings,
    saveAiSettings,
    saveCompanySettings
}: SettingsFormProps) {
    const [showSuccess, setShowSuccess] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_API_KEY_PREVIEW || '••••••••')

    const createSubmitHandler = (saveAction: (formData: FormData) => Promise<{ success: boolean }>, tabName: string) => {
        return async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)

            startTransition(async () => {
                const result = await saveAction(formData)
                if (result.success) {
                    setShowSuccess(tabName)
                    setTimeout(() => setShowSuccess(null), 3000)
                }
            })
        }
    }

    const generateApiKey = () => {
        const newKey = 'pmsk_' + Array.from({ length: 32 }, () =>
            Math.random().toString(36)[2]).join('')
        setApiKey(newKey)
        navigator.clipboard.writeText(newKey)
        alert('New API key generated and copied to clipboard!\n\nAdd this to your .env file:\nAPI_KEY=' + newKey)
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Configure integrations, email notifications, and API access</p>
            </div>

            {showSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center justify-between">
                    <span>✓ {showSuccess} settings saved successfully!</span>
                    <button onClick={() => setShowSuccess(null)} className="text-green-600 hover:text-green-800">×</button>
                </div>
            )}

            <Tabs defaultValue="company" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto">
                    <TabsTrigger value="company">Company</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="ai">AI Integration</TabsTrigger>
                    <TabsTrigger value="api">API Access</TabsTrigger>
                </TabsList>

                {/* Company Configuration Tab */}
                <TabsContent value="company">
                    <form onSubmit={createSubmitHandler(saveCompanySettings, 'Company')} className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Company Details</CardTitle>
                                <CardDescription>These details will appear on invoices and emails</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Company Name</Label>
                                        <Input
                                            id="companyName"
                                            name="companyName"
                                            defaultValue={settings?.companyName || ''}
                                            placeholder="Your Agency Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="companyGst">GST Number</Label>
                                        <Input
                                            id="companyGst"
                                            name="companyGst"
                                            defaultValue={settings?.companyGst || ''}
                                            placeholder="GSTIN..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="companyAddress">Address</Label>
                                    <Textarea
                                        id="companyAddress"
                                        name="companyAddress"
                                        defaultValue={settings?.companyAddress || ''}
                                        placeholder="Full business address..."
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyEmail">Email</Label>
                                        <Input
                                            id="companyEmail"
                                            name="companyEmail"
                                            type="email"
                                            defaultValue={settings?.companyEmail || ''}
                                            placeholder="billing@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="companyPhone">Phone</Label>
                                        <Input
                                            id="companyPhone"
                                            name="companyPhone"
                                            type="tel"
                                            defaultValue={settings?.companyPhone || ''}
                                            placeholder="+91..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="companyWebsite">Website</Label>
                                        <Input
                                            id="companyWebsite"
                                            name="companyWebsite"
                                            type="url"
                                            defaultValue={settings?.companyWebsite || ''}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Saving...' : 'Save Company Settings'}
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* Email Configuration Tab */}
                <TabsContent value="email">
                    <form onSubmit={createSubmitHandler(saveEmailSettings, 'Email')} className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>SMTP Configuration</CardTitle>
                                <CardDescription>Configure SMTP for automated email notifications</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpHost">SMTP Host</Label>
                                        <Input
                                            id="smtpHost"
                                            name="smtpHost"
                                            defaultValue={settings?.smtpHost || ''}
                                            placeholder="smtp-relay.brevo.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpPort">SMTP Port</Label>
                                        <Input
                                            id="smtpPort"
                                            name="smtpPort"
                                            type="number"
                                            defaultValue={settings?.smtpPort || 587}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                                    <Input
                                        id="smtpUsername"
                                        name="smtpUsername"
                                        defaultValue={settings?.smtpUsername || ''}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                                    <Input
                                        id="smtpPassword"
                                        name="smtpPassword"
                                        type="password"
                                        defaultValue={settings?.smtpPassword || ''}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpFromEmail">From Email</Label>
                                        <Input
                                            id="smtpFromEmail"
                                            name="smtpFromEmail"
                                            type="email"
                                            defaultValue={settings?.smtpFromEmail || ''}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpFromName">From Name</Label>
                                        <Input
                                            id="smtpFromName"
                                            name="smtpFromName"
                                            defaultValue={settings?.smtpFromName || 'PM System'}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Saving...' : 'Save Email Settings'}
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* Payment Gateway Tab */}
                <TabsContent value="payment">
                    <form onSubmit={createSubmitHandler(savePaymentSettings, 'Payment')} className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Razorpay Configuration</CardTitle>
                                <CardDescription>Configure payment gateway for invoice payments</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                                    <Input
                                        id="razorpayKeyId"
                                        name="razorpayKeyId"
                                        defaultValue={settings?.razorpayKeyId || ''}
                                        placeholder="rzp_test_..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                                    <Input
                                        id="razorpayKeySecret"
                                        name="razorpayKeySecret"
                                        type="password"
                                        defaultValue={settings?.razorpayKeySecret || ''}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Saving...' : 'Save Payment Settings'}
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* Email Templates Tab */}
                <TabsContent value="templates">
                    <form onSubmit={createSubmitHandler(saveTemplateSettings, 'Template')} className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Email Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Enable Invoice Emails</Label>
                                        <p className="text-xs text-muted-foreground">Allow sending invoices via email</p>
                                    </div>
                                    <Switch name="enableInvoiceEmails" defaultChecked={settings?.enableInvoiceEmails ?? true} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Reminder Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Enable Payment Reminders</Label>
                                        <p className="text-xs text-muted-foreground">Allow sending payment reminders</p>
                                    </div>
                                    <Switch name="paymentReminderEnabled" defaultChecked={settings?.paymentReminderEnabled ?? true} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paymentReminderMessage">Reminder Message Template</Label>
                                    <Textarea
                                        id="paymentReminderMessage"
                                        name="paymentReminderMessage"
                                        rows={4}
                                        defaultValue={settings?.paymentReminderMessage || 'This is a gentle reminder that invoice {invoice_number} for {amount} is pending payment. Please process the payment at your earliest convenience. Thank you!'}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Saving...' : 'Save Template Settings'}
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <form onSubmit={createSubmitHandler(saveNotificationSettings, 'Notification')} className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Email Notifications</CardTitle>
                                <CardDescription>Control which events trigger automatic emails</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Ticket Created</Label>
                                    <Switch name="emailOnTicketCreated" defaultChecked={settings?.emailOnTicketCreated ?? true} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Ticket Assigned</Label>
                                    <Switch name="emailOnTicketAssigned" defaultChecked={settings?.emailOnTicketAssigned ?? true} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Status Changed</Label>
                                    <Switch name="emailOnTicketStatusChange" defaultChecked={settings?.emailOnTicketStatusChange ?? false} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Review Requested</Label>
                                    <Switch name="emailOnReviewRequested" defaultChecked={settings?.emailOnReviewRequested ?? true} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Review Approved</Label>
                                    <Switch name="emailOnReviewApproved" defaultChecked={settings?.emailOnReviewApproved ?? true} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Comment Added</Label>
                                    <Switch name="emailOnCommentAdded" defaultChecked={settings?.emailOnCommentAdded ?? false} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Invoice Created</Label>
                                    <Switch name="emailOnInvoiceCreated" defaultChecked={settings?.emailOnInvoiceCreated ?? true} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Invoice Paid</Label>
                                    <Switch name="emailOnInvoicePaid" defaultChecked={settings?.emailOnInvoicePaid ?? true} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Deadline Approaching</Label>
                                    <Switch name="emailOnDeadlineApproaching" defaultChecked={settings?.emailOnDeadlineApproaching ?? true} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Project Created</Label>
                                    <Switch name="emailOnProjectCreated" defaultChecked={settings?.emailOnProjectCreated ?? false} />
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Saving...' : 'Save Notification Settings'}
                            </Button>
                        </div>
                    </form>
                </TabsContent>



                {/* AI Integration Tab */}
                <TabsContent value="ai">
                    <form onSubmit={createSubmitHandler(saveAiSettings, 'AI Integration')} className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Configuration</CardTitle>
                                <CardDescription>Configure AI settings for intelligent features</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="geminiApiKey">Gemini API Key</Label>
                                    <Input
                                        id="geminiApiKey"
                                        name="geminiApiKey"
                                        type="password"
                                        defaultValue={settings?.geminiApiKey || ''}
                                        placeholder="AIza..."
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter your Google Gemini API key to enable AI features.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Saving...' : 'Save AI Settings'}
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* API Access Tab */}
                <TabsContent value="api" className="space-y-6 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>API Access</CardTitle>
                            <CardDescription>Manage API keys for n8n and external integrations</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Current API Key</Label>
                                <div className="flex gap-2">
                                    <Input value={apiKey} readOnly className="font-mono" />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            navigator.clipboard.writeText(apiKey)
                                            alert('API key copied!')
                                        }}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={generateApiKey}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Generate New
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Add to .env: <code className="bg-muted px-1 rounded">API_KEY=your_key_here</code>
                                </p>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label>Available Endpoints</Label>
                                <div className="space-y-1 text-sm font-mono bg-muted p-3 rounded">
                                    <div>GET /api/projects</div>
                                    <div>POST /api/projects</div>
                                    <div>GET /api/tickets</div>
                                    <div>POST /api/tickets</div>
                                    <div>PATCH /api/tickets</div>
                                    <div>GET /api/clients</div>
                                    <div>POST /api/clients</div>
                                    <div>GET /api/invoices</div>
                                    <div>POST /api/invoices/send</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
