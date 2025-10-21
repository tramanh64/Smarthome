// src/components/Dashboard/ActuatorToggle.jsx
import { Card, CardContent, Typography, Switch, FormControlLabel, Button, Box } from "@mui/material";

export default function ActuatorToggle({
  title,
  on,
  onChange,
  labels = { on: "On", off: "Off" },
  disabled = false,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        width: 220,
        height: 180,
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          borderColor: on ? 'primary.main' : 'divider',
        },
      }}
    >
      <CardContent 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3
        }}
      >
        <Typography
          sx={{ 
            fontSize: '0.95rem',
            color: "text.secondary",
            fontWeight: 500,
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {title}
        </Typography>
        
        {title.includes("Door") ? (
          <Button
            variant={on ? "outlined" : "contained"}
            onClick={() => onChange(!on)}
            disabled={disabled}
            sx={{ 
              minWidth: 120,
              height: 48,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'text.disabled'
              }
            }}
          >
            {title.includes("Locked") ? "Unlock" : "Lock"}
          </Button>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 2,
            flex: 1,
            justifyContent: 'center'
          }}>
            <Switch
              checked={on}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              sx={{
                width: 62,
                height: 34,
                padding: 0,
                '& .MuiSwitch-switchBase': {
                  padding: 0,
                  margin: '2px',
                  transitionDuration: '300ms',
                  '&.Mui-checked': {
                    transform: 'translateX(28px)',
                    color: '#fff',
                    '& + .MuiSwitch-track': {
                      backgroundColor: 'primary.main',
                      opacity: 1,
                      border: 0,
                    },
                    '&.Mui-disabled + .MuiSwitch-track': {
                      opacity: 0.5,
                    },
                  },
                  '&.Mui-focusVisible .MuiSwitch-thumb': {
                    color: '#33cf4d',
                    border: '6px solid #fff',
                  },
                  '&.Mui-disabled .MuiSwitch-thumb': {
                    color: '#f5f5f5',
                  },
                  '&.Mui-disabled + .MuiSwitch-track': {
                    opacity: 0.3,
                  },
                },
                '& .MuiSwitch-thumb': {
                  boxSizing: 'border-box',
                  width: 30,
                  height: 30,
                  boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
                },
                '& .MuiSwitch-track': {
                  borderRadius: 34 / 2,
                  backgroundColor: '#E9E9EA',
                  opacity: 1,
                  transition: 'background-color 500ms',
                },
              }}
            />
            <Typography 
              sx={{ 
                fontSize: '1rem',
                fontWeight: 600,
                color: on ? 'primary.main' : 'text.secondary',
                transition: 'color 300ms',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {on ? labels.on : labels.off}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}