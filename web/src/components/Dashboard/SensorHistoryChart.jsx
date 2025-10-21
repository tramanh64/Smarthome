// src/components/Dashboard/SensorHistoryChart.jsx
import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Paper, Typography, Box, CircularProgress } from "@mui/material";

export default function SensorHistoryChart({ title, data, dataKey, unit }) {
  // Chuyển Firestore Timestamp -> số ms để Recharts render chuẩn
  const chartData = useMemo(() => {
    return (data || []).map((d) => {
      let ms = null;
      if (d.ts?.seconds) ms = d.ts.seconds * 1000;
      else if (typeof d.ts === "number") ms = d.ts;
      else if (d.ts instanceof Date) ms = d.ts.getTime();
      return { ...d, t: ms };
    });
  }, [data]);

  const fmtTime = (ms) =>
    ms ? new Date(ms).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2,
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#fff',
        minWidth: 0,
        width: '100%',
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {title}
        <Typography 
          component="span" 
          sx={{ 
            fontSize: '0.875rem',
            color: 'text.secondary',
            fontWeight: 500
          }}
        >
          ({unit})
        </Typography>
      </Typography>

      {chartData.length < 2 ? (
        <Box sx={{ 
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2
        }}>
          <CircularProgress size={36} thickness={4} />
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            Collecting data...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#eee" 
              />
              <XAxis
                dataKey="t"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={fmtTime}
                fontSize={12}
                tick={{ fill: '#666' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: '#666' }}
              />
              <Tooltip
                labelFormatter={(v) => fmtTime(v)}
                formatter={(v) => [`${Number(v).toFixed(1)} ${unit || ""}`, title]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ 
                  r: 4, 
                  fill: '#2563eb'
                }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}