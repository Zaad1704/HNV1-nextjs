import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OccupancyData {
    name: string;
    "New Tenants": number;
}

const OccupancyChart: React.FC<{ data: OccupancyData[] }> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <LineChart
                data={data}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" /> {/* Semantic border color */}
                <XAxis dataKey="name" stroke="var(--light-text)" fontSize={12} tickLine={false} axisLine={false} /> {/* Semantic text color */}
                <YAxis stroke="var(--light-text)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} /> {/* Semantic text color */}
                <Tooltip 
                    contentStyle={{
                        background: 'var(--light-card)', // Semantic light card
                        border: '1px solid var(--border-color)', // Semantic border color
                        borderRadius: '0.5rem',
                        color: 'var(--dark-text)' // Semantic dark text
                    }}
                />
                <Legend wrapperStyle={{ fontSize: '14px', color: 'var(--dark-text)' }}/> {/* Semantic text color */}
                <Line type="monotone" dataKey="New Tenants" stroke="var(--brand-primary)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} /> {/* Semantic brand color */}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default OccupancyChart;
