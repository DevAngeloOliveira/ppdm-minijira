import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomDrawer from '../components/CustomDrawer';
import { colors } from '../../src/theme/colors';

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background.light,
          },
          headerTintColor: colors.text.dark,
          headerTitleStyle: {
            fontWeight: '600',
          },
          drawerStyle: {
            width: 280,
          },
          drawerType: 'front',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <Drawer.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="projects"
          options={{
            title: 'Projetos',
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="notifications"
          options={{
            title: 'Notificações',
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: 'Configurações',
            headerShown: false,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
