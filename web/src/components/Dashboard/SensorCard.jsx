// src/components/Dashboard/SensorCard.jsx
import { Card, CardContent, Typography, Box } from "@mui/material";

export default function SensorCard({ title, children }) {
  return (
    <Card
      variant="outlined"
      sx={{
        width: 200,
        height: 160,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardContent sx={{ 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 2
      }}>
        <Typography 
          sx={{ 
            fontSize: 14, 
            color: "text.secondary",
            fontWeight: 500,
            whiteSpace: 'nowrap'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: "bold",
            color: 'primary.main',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            textAlign: 'center'
          }}
        >
          {children}
        </Typography>
      </CardContent>
    </Card>
  );
}