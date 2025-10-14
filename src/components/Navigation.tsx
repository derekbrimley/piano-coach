import Box from '@mui/joy/Box';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import MenuButton from '@mui/joy/MenuButton';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: any) => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'goalSetup', label: 'Goals', icon: '🎯' },
    { id: 'sessionGenerator', label: 'Practice', icon: '🎹' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  const handleTabChange = (_event: React.SyntheticEvent | null, newValue: string | number | null) => {
    if (newValue) {
      onNavigate(newValue as string);
    }
  };

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.surface',
        px: { xs: 1, sm: 2 },
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2
      }}
    >
      <Typography
        level="h4"
        sx={{
          display: { xs: 'none', sm: 'block' },
          fontWeight: 'bold'
        }}
      >
        🎹 Piano Coach
      </Typography>

      <Tabs
        value={currentView}
        onChange={handleTabChange}
        sx={{ flex: 1, maxWidth: { xs: '100%', sm: 600 } }}
      >
        <TabList
          sx={{
            overflow: 'auto',
            scrollSnapType: 'x mandatory',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {navItems.map((item) => (
            <Tab
              key={item.id}
              value={item.id}
              sx={{ flex: { xs: 1, sm: 'auto' }, minWidth: { xs: 80, sm: 100 } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span>{item.icon}</span>
                <Typography level="body-sm" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  {item.label}
                </Typography>
              </Box>
            </Tab>
          ))}
        </TabList>
      </Tabs>

      <Dropdown>
        <MenuButton
          slots={{ root: IconButton }}
          slotProps={{ root: { variant: 'outlined', color: 'neutral' } }}
        >
          ⚙️
        </MenuButton>
        <Menu placement="bottom-end">
          <MenuItem onClick={onLogout}>Sign Out</MenuItem>
        </Menu>
      </Dropdown>
    </Box>
  );
};

export default Navigation;
