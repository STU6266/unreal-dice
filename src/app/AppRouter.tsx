import { Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { copy } from '../content/en'
import { HomeScreen } from '../screens/HomeScreen'
import { PlaceholderScreen } from '../screens/PlaceholderScreen'

export function AppRouter() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
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
