import { Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { copy } from '../content/en'
import { GroupFeaturePlaceholderScreen } from '../screens/GroupFeaturePlaceholderScreen'
import { GroupEditorScreen } from '../screens/GroupEditorScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { ImportBackupScreen } from '../screens/ImportBackupScreen'
import { MyGroupsScreen } from '../screens/MyGroupsScreen'
import { PlaceholderScreen } from '../screens/PlaceholderScreen'
import { QuickStartScreen } from '../screens/QuickStartScreen'

export function AppRouter() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/quick-start" element={<QuickStartScreen />} />
        <Route path="/groups" element={<MyGroupsScreen />} />
        <Route path="/groups/new" element={<GroupEditorScreen mode="create" />} />
        <Route path="/import" element={<ImportBackupScreen />} />
        <Route
          path="/play/quick-start/:groupId"
          element={<GroupFeaturePlaceholderScreen mode="play-quick-start" />}
        />
        <Route
          path="/play/group/:groupId"
          element={<GroupFeaturePlaceholderScreen mode="play-group" />}
        />
        <Route
          path="/groups/:groupId/edit"
          element={<GroupEditorScreen mode="edit" />}
        />
        {copy.placeholders.map((placeholder) => (
          <Route
            key={placeholder.path}
            path={placeholder.path}
            element={<PlaceholderScreen title={placeholder.title} />}
          />
        ))}
      </Routes>
    </AppShell>
  )
}
