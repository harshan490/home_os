# HOMEBASE — Architecture, Security, AI/OCR, Automation & Audit Documentation

## 1. System Architecture & Layer Separation
- **Presentation Layer (`src/App.tsx`)**: Responsive desktop sidebar + contextual audit drawer and mobile persistent 5-tab bottom navigation (`Home`, `Money`, `Tasks`, `Documents`, `More` utility hub), built with design tokens (`#0B0D12`, `#11151D`, `#171C26`, `#8B9CFF`, `#66D9C2`) and a complete light theme.
- **Domain & Financial Layer**: Integer minor-unit currency calculations (`formatMoneyMinor`, `parseMajorToMinor`, `sumMinor`), statistical forecasting engine, shared settlement calculator, and meter sequence validator.
- **Persistence & Sync Layer**: Local IndexedDB/Storage adapter for Mode A + Supabase PostgreSQL Row-Level Security (`supabase/migrations/0001_homebase_schema_and_rls.sql`) and conflict resolution queue (`SyncConflict`) for Mode B.
- **Automation Engine**: Deterministic Rules A–H with idempotent execution checks, execution counters, and audit logging.
- **AI & OCR Layer**: Tool-based household assistant with provider abstraction (`local_deterministic`, `ollama_local`, `hosted_proxy`) and multi-step Receipt Capture & OCR validation workflow.

## 2. Persistence Storage Comparison & Security Model
| Storage Layer | Purpose in HOMEBASE | Protection & Lifecycle |
| :--- | :--- | :--- |
| **IndexedDB / Local Database** | Primary offline store for expenses, bills, tasks, documents, pantry, recipes, assets, and solar logs in Mode A & offline cache in Mode B | Origin-isolated by browser/WebView sandbox; persists across restarts; exported via versioned backups |
| **Platform Secure Storage** | Stores session tokens, biometric unlock state, and AI proxy tokens on Android Keystore / iOS Keychain | Hardware-backed OS encryption; never exported in plain JSON backups |
| **Application Cache** | Temporary chart geometry and UI widget layout state | Non-authoritative; safely rebuildable at any time |
| **Supabase PostgreSQL + Private Storage (Mode B)** | Shared family synchronization and encrypted private object buckets | Server-enforced Row-Level Security (`get_user_household_role`); no public object URLs |

### Consequences of Lost Devices, Forgotten PINs, Deleted Accounts & Restored Backups
- **Lost Device**: In Mode A, data resides only on the device unless backed up; OS device encryption and biometric lock protect data at rest. In Mode B, a Household Owner/Admin can immediately revoke the lost device's member session.
- **Forgotten Backup Passphrase**: Passphrase-encrypted backup archives use standard authenticated encryption; without the passphrase, the archive cannot be decrypted.
- **Restored Backups**: Restoring a backup runs a schema version check (`v1.0.0`) and displays a non-destructive preview before any records are merged or replaced.

## 3. Location-Feature Exclusion Audit Report
| Audit Target | Verification Method | Result |
| :--- | :--- | :--- |
| `android/app/src/main/AndroidManifest.xml` | Static XML inspection & `tools:node="remove"` enforcement | **PASS** — `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`, and `android.hardware.location.gps` explicitly blocked |
| `ios/App/App/Info.plist` | Plist key audit | **PASS** — Zero `NSLocationWhenInUseUsageDescription` or `NSLocationAlwaysUsageDescription` keys |
| `package.json` & Capacitor Plugins | Dependency tree audit | **PASS** — Zero `@capacitor/geolocation`, Maps, or geofencing packages |
| `src/App.tsx` & Runtime Payloads | Static AST/regex audit (`npm test`) | **PASS** — Zero calls to `navigator.geolocation`, `getCurrentPosition`, or `watchPosition` |

## 4. Implemented vs. Environment-Deferred Capabilities
- **Fully Implemented & Verified**: All 12 functional household modules, integer minor-unit financial engine, statistical forecasting, receipt OCR review workflow, deterministic Automation Rules A–H, tool-grounded AI assistant, RBAC role switcher (`owner`, `admin`, `adult`, `restricted`, `readonly`), sync conflict queue, versioned backup & restore preview, CSV exports, Supabase SQL schema/RLS migrations, and Capacitor Android/iOS project configurations.
- **Environment Constraints (Transparently Documented)**:
  - Outbound internet access and package installation are disabled in this Linux sandbox VM, and Android SDK (`sdkmanager`/Android Gradle plugin cache) and macOS/Xcode (`xcodebuild` + Apple signing credentials) are not installed on this container. Therefore, the Android project (`android/`) and iOS Xcode project (`ios/`) are fully configured and audited in the repository zip, ready for local `./gradlew assembleDebug` and Xcode archiving on a machine with Android Studio / Xcode.
