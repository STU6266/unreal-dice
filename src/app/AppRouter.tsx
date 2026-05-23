import { Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { GroupEditorScreen } from '../screens/GroupEditorScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { ImportBackupScreen } from '../screens/ImportBackupScreen'
import { MyGroupsScreen } from '../screens/MyGroupsScreen'
import { QuickStartScreen } from '../screens/QuickStartScreen'
import { CoinRandomScreen } from '../screens/CoinRandomScreen'
import { CoinFlipScreen } from '../screens/CoinFlipScreen'
import { RandomNumberScreen } from '../screens/RandomNumberScreen'
import { PlayModeScreen } from '../screens/PlayModeScreen'
import { InstallAppScreen } from '../screens/InstallAppScreen'

export function AppRouter() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/quick-start" element={<QuickStartScreen />} />
        <Route path="/groups" element={<MyGroupsScreen />} />
        <Route path="/groups/new" element={<GroupEditorScreen mode="create" />} />
        <Route path="/import" element={<ImportBackupScreen />} />
        <Route path="/random" element={<CoinRandomScreen />} />
        <Route path="/random/coin" element={<CoinFlipScreen />} />
        <Route path="/random/number" element={<RandomNumberScreen />} />
        <Route path="/install" element={<InstallAppScreen />} />
        <Route
          path="/play/quick-start/:groupId"
          element={<PlayModeScreen source="quick-start" />}
        />
        <Route
          path="/play/group/:groupId"
          element={<PlayModeScreen source="saved" />}
        />
        <Route
          path="/groups/:groupId/edit"
          element={<GroupEditorScreen mode="edit" />}
        />
      </Routes>
    </AppShell>
  )
}
