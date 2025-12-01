import { SettingsForm } from "@/components/settings/SettingsForm"
import { BackupRestore } from "@/components/settings/BackupRestore"
import { DataReset } from "@/components/settings/DataReset"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your business profile and application preferences.
                </p>
            </div>
            <SettingsForm />
            <BackupRestore />
            <DataReset />
        </div>
    )
}
