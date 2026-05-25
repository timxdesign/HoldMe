import { AppShell } from "@/components/layout/app-shell"
import { PushRegistration } from "@/components/push/push-registration"
import { PwaInstallPrompt } from "@/components/pwa/install-prompt"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <AppShell userId={user?.id}>
      <PushRegistration />
      <PwaInstallPrompt />
      {children}
    </AppShell>
  )
}
