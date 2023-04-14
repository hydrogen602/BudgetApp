import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, Typography } from '@mui/material';
import { Openable } from './commonTypes';
import { useState } from 'react';
import { CurrencyInput, HourInput } from './NumericInput';
import { Dinero } from "dinero.js";
import DineroBuilder from "dinero.js";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`income-options-tabpanel-${index}`}
      aria-labelledby={`income-options-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `income-options-tab-${index}`,
    'aria-controls': `income-options-tabpanel-${index}`,
  };
}

interface IIncomeOptionsProps extends Openable {
  setIncome: (_: Dinero) => void;
}

export default function IncomeOptions({ open, onClose, setIncome }: IIncomeOptionsProps) {
  const [tab, setTab] = useState(0);

  const [incomeYearly, setIncomeYearly] = useState<Dinero>(DineroBuilder({ amount: 0, currency: 'USD' }));
  const [hourlyWage, setHourlyWage] = useState<Dinero>(DineroBuilder({ amount: 0, currency: 'USD' }));
  const [hours, setHours] = useState(0);

  const totalIncome = hourlyWage.multiply(hours).add(incomeYearly.divide(12));

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Income Options</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} aria-label="job types">
            <Tab label="Annual Salary" {...a11yProps(0)} />
            <Tab label="Hourly Wage" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <TabPanel value={tab} index={0}>
          <CurrencyInput props={{
            label: 'Annual Salary',
            size: 'small',
            fullWidth: true,
          }} onChange={setIncomeYearly} value={incomeYearly} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <CurrencyInput
            props={{
              label: 'Hourly Wage',
              size: 'small',
              fullWidth: true,
            }} onChange={setHourlyWage} value={hourlyWage} />
          <HourInput props={{
            label: 'Hours per Month',
            size: 'small',
            fullWidth: true,
          }} onChange={setHours} value={hours} />
        </TabPanel>
        <Typography variant="body2">
          {`Monthly Income: ${totalIncome.toFormat('$0,0.00')}`}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => {
          setIncome(totalIncome);
          onClose();
        }} disabled={false}>Done</Button>
      </DialogActions>
    </Dialog>

  );
}