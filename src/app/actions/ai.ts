'use server'

import { generateContent } from "@/lib/gemini";

export async function generateTicketDescription(title: string, context?: string) {
    try {
        const { prisma } = await import("@/lib/prisma");
        const settings = await prisma.settings.findFirst();
        if (!settings?.geminiApiKey) {
            return { success: false, error: "Gemini API Key not configured. Please add it in Settings." };
        }

        const prompt = context
            ? `Generate or update a ticket description for: "${title}".
               
               User's selected context/instruction: "${context}"
               
               If the context is an instruction, follow it. If it's content, incorporate it.
               
               Format (be concise):
               - **Objective** (1 line)
               - **Acceptance Criteria** (3-4 bullets max)
               - **Subtasks** (3-5 items)
               
               Keep it brief and actionable.`
            : `Generate a ticket description for: "${title}".
        
        Format (be concise):
        - **Objective** (1 line)
        - **Acceptance Criteria** (3-4 bullets max)
        - **Subtasks** (3-5 items)
        
        Keep it brief and actionable.`;

        const description = await generateContent(prompt);
        return { success: true, description };
    } catch (error) {
        console.error("AI Generation Error:", error);
        return { success: false, error: "Failed to generate description" };
    }
}

export async function summarizeTicket(ticketId: string) {
    try {
        const { prisma } = await import("@/lib/prisma");
        const settings = await prisma.settings.findFirst();
        if (!settings?.geminiApiKey) {
            return { success: false, error: "Gemini API Key not configured. Please add it in Settings." };
        }

        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: { comments: true }
        });

        if (!ticket) return { success: false, error: "Ticket not found" };

        const commentsText = ticket.comments.map(c => c.content).join("\n");
        const prompt = `Summarize this ticket:
        
        Title: ${ticket.title}
        Description: ${ticket.description}
        Comments: ${commentsText}
        
        Output (3 sections, 1-2 lines each):
        - **Status**
        - **Blockers** (if none, write "None")
        - **Next Steps**`;

        const summary = await generateContent(prompt);
        return { success: true, summary };
    } catch (error) {
        console.error("AI Summarization Error:", error);
        return { success: false, error: "Failed to summarize ticket" };
    }
}

export async function generateSubtasks(ticketId: string) {
    try {
        const { prisma } = await import("@/lib/prisma");
        const settings = await prisma.settings.findFirst();
        if (!settings?.geminiApiKey) {
            return { success: false, error: "Gemini API Key not configured. Please add it in Settings." };
        }

        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId }
        });

        if (!ticket) return { success: false, error: "Ticket not found" };

        const prompt = `Based on the following ticket, generate a list of 3-5 actionable subtasks. Return ONLY the subtasks as a JSON array of strings.
        Title: ${ticket.title}
        Description: ${ticket.description}`;

        const content = await generateContent(prompt);
        // Attempt to parse JSON, or fallback to splitting lines
        let subtasks = [];
        try {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                subtasks = JSON.parse(jsonMatch[0]);
            } else {
                subtasks = content.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, ''));
            }
        } catch (e) {
            subtasks = content.split('\n').filter(line => line.trim().length > 0);
        }

        return { success: true, subtasks };
    } catch (error) {
        console.error("AI Subtask Generation Error:", error);
        return { success: false, error: "Failed to generate subtasks" };
    }
}

export async function generateProjectInsights(projectId: string) {
    try {
        const { prisma } = await import("@/lib/prisma");
        const settings = await prisma.settings.findFirst();
        console.log("AI Action: Settings found:", !!settings);
        if (settings) {
            console.log("AI Action: API Key present:", !!(settings as any).geminiApiKey);
        }

        if (!settings?.geminiApiKey) {
            console.error("AI Action: Missing API Key");
            return { success: false, error: "Gemini API Key not configured. Please add it in Settings." };
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                tickets: true,
                client: true
            }
        });

        if (!project) return { success: false, error: "Project not found" };

        const totalTickets = project.tickets.length;
        const completedTickets = project.tickets.filter(t => t.status === 'DONE').length;
        const openTickets = project.tickets.filter(t => t.status === 'OPEN').length;

        const prompt = `Analyze the following project status and provide 3 key insights or risks.
        Project: ${project.title}
        Client: ${project.client.companyName}
        Total Tickets: ${totalTickets}
        Completed: ${completedTickets}
        Open: ${openTickets}
        
        Tickets:
        ${project.tickets.map(t => `- ${t.title} (${t.status})`).join('\n')}
        
        Format as a markdown list.`;

        const insights = await generateContent(prompt);
        return { success: true, insights };
    } catch (error) {
        console.error("AI Insights Error:", error);
        return { success: false, error: "Failed to generate insights" };
    }
}
export async function generateProposalContent(title: string, clientName: string) {
    try {
        const { prisma } = await import("@/lib/prisma");
        const settings = await prisma.settings.findFirst();

        if (!settings?.geminiApiKey) {
            return { success: false, error: "Gemini API Key not configured." };
        }

        const prompt = `Create a proposal for: ${title} (Client: ${clientName})
        
        Output JSON:
        {
            "scope": "Brief scope (2-3 sentences)",
            "items": [
                { "description": "Item", "amount": 1000 }
            ]
        }
        
        Keep scope concise, 3-5 line items.`;

        const content = await generateContent(prompt);

        // Parse JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return { success: true, data: parsed };
        }

        return { success: false, error: "Failed to parse AI response" };
    } catch (error) {
        console.error("AI Proposal Error:", error);
        return { success: false, error: "Failed to generate proposal" };
    }
}
export async function generateContractContent(title: string, clientName: string, templateType: string) {
    try {
        const { prisma } = await import("@/lib/prisma");
        const settings = await prisma.settings.findFirst();

        if (!settings?.geminiApiKey) {
            return { success: false, error: "Gemini API Key not configured." };
        }

        const prompt = `Create a ${templateType} contract for: ${title} (Client: ${clientName})
        
        HTML output (no <html>/<body> tags). Include:
        - Parties
        - Scope
        - Terms
        - Payment
        - Signatures
        
        Keep it concise but professional.`;

        const content = await generateContent(prompt);
        return { success: true, content };
    } catch (error) {
        console.error("AI Contract Error:", error);
        return { success: false, error: "Failed to generate contract" };
    }
}

export async function generateDashboardInsights(targetRevenue: number, targetProjects: number) {
    try {
        const { prisma } = await import("@/lib/prisma");
        const settings = await prisma.settings.findFirst();

        if (!settings?.geminiApiKey) {
            return { success: false, error: "Gemini API Key not configured." };
        }

        // Get current metrics
        const [activeProjects, paidInvoices, sentInvoices, draftInvoices] = await Promise.all([
            prisma.project.count({ where: { status: 'ACTIVE' } }),
            prisma.invoice.findMany({
                where: { status: 'PAID' },
                select: { totalAmount: true, currency: true }
            }),
            prisma.invoice.count({ where: { status: 'SENT' } }),
            prisma.invoice.count({ where: { status: 'DRAFT' } })
        ]);

        const { convertToINR } = await import("@/lib/currency");
        let currentRevenue = 0;
        for (const inv of paidInvoices) {
            currentRevenue += await convertToINR(Number(inv.totalAmount), inv.currency);
        }

        const prompt = `Analyze business metrics:

**Current:** ₹${currentRevenue.toFixed(0)} revenue, ${activeProjects} projects, ${sentInvoices} pending invoices, ${draftInvoices} drafts
**Target:** ₹${targetRevenue} revenue, ${targetProjects} projects

**Output (concise):**
1. **Gap** - Calculate shortfall
2. **Actions** - 3-5 specific steps (e.g., "Convert 2 drafts")
3. **Quick Wins** - 1-2 immediate actions
4. **Growth Tips** - 2-3 strategies

Use bullets. Be brief and actionable.`;

        const insights = await generateContent(prompt);
        return {
            success: true,
            insights,
            currentRevenue,
            currentProjects: activeProjects,
            revenueGap: targetRevenue - currentRevenue,
            projectsGap: targetProjects - activeProjects
        };
    } catch (error) {
        console.error("AI Dashboard Insights Error:", error);
        return { success: false, error: "Failed to generate insights" };
    }
}
