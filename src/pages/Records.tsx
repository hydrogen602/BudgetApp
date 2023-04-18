import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import BottomNav from "../components/BottomNav";
import MenuIcon from '@mui/icons-material/Menu';


export default function Records() {
  return (<>
    <AppBar position="static" sx={{
      marginBottom: '2rem',
    }}>
      <Toolbar>
        <IconButton
          size="medium"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 1 }}
          onClick={() => { }}
        >
          <MenuIcon />
        </IconButton>
        {/* <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} >
          <FileMenu
            onClose={() => setAnchorEl(null)}
            openHandler={openHandler}
            saveHandler={saveHandler}
            saveAsHandler={saveAsHandler}
            onExpenseAdd={() => setExpenseDialogOpen(true)}
            onExpenseEdit={() => setExpenseEdit(true)}
          />
        </Menu> */}
        <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
          Records
        </Typography>

      </Toolbar>
    </AppBar>
    <div>
      Records
    </div>
    <BottomNav />
  </>
  );
}