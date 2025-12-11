'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface DashboardChartsProps {
    revenueData: { month: string; revenue: number }[]
    statusData: { name: string; value: number; fill: string }[]
}

export function DashboardCharts({ revenueData, statusData }: DashboardChartsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis
                                dataKey="month"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₹${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{
                                    backgroundColor: 'var(--popover)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--popover-foreground)',
                                    borderRadius: 'var(--radius)',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Invoice Status Donut Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Invoice Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--popover)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--popover-foreground)',
                                    borderRadius: 'var(--radius)',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Legend
                                iconSize={12}
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                wrapperStyle={{
                                    fontSize: '14px',
                                    fontWeight: 500
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
