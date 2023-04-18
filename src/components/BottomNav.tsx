import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import DataUsageIcon from '@mui/icons-material/DataUsage';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import { BottomNavContext } from "../App";

export default function BottomNav() {
  const [value, setValue] = useContext(BottomNavContext);

  return (
    <BottomNavigation showLabels value={value} onChange={(_, newValue) => {
      setValue(newValue);
    }} sx={{
      borderTop: '1px solid #e0e0e0',
    }}>
      <BottomNavigationAction label="Budget" icon={<DataUsageIcon />} component={Link} to="/" />
      <BottomNavigationAction label="Records" icon={<BackupTableIcon />} component={Link} to="/records" />
    </BottomNavigation>);
}