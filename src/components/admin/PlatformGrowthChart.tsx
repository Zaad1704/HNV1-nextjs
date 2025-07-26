import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PlatformGrowthChart = ({ data }: { data: any[] }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false}/>
                <Tooltip wrapperStyle={{ outline: "none", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}/>
                <Legend />
                <Line type="monotone" dataKey="New Users" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="New Organizations" stroke="#10b981" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default PlatformGrowthChart;
