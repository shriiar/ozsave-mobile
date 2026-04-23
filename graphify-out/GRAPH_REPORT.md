# Graph Report - .  (2026-04-23)

## Corpus Check
- 105 files · ~69,482 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 471 nodes · 605 edges · 64 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_API & Screen Hooks|API & Screen Hooks]]
- [[_COMMUNITY_Auth Signup & Verification|Auth Signup & Verification]]
- [[_COMMUNITY_Billing List View|Billing List View]]
- [[_COMMUNITY_Cost List View|Cost List View]]
- [[_COMMUNITY_Shared Form Utilities|Shared Form Utilities]]
- [[_COMMUNITY_Income List View|Income List View]]
- [[_COMMUNITY_Shared Entry Form Logic|Shared Entry Form Logic]]
- [[_COMMUNITY_Auth Context & Gate|Auth Context & Gate]]
- [[_COMMUNITY_Edit Billing Modal|Edit Billing Modal]]
- [[_COMMUNITY_Edit Income Modal Logic|Edit Income Modal Logic]]
- [[_COMMUNITY_Dashboard State Provider|Dashboard State Provider]]
- [[_COMMUNITY_Data Formatters|Data Formatters]]
- [[_COMMUNITY_Edit Cost Modal|Edit Cost Modal]]
- [[_COMMUNITY_Brand Assets & Icons|Brand Assets & Icons]]
- [[_COMMUNITY_Edit Income Modal|Edit Income Modal]]
- [[_COMMUNITY_iOS Native Layer|iOS Native Layer]]
- [[_COMMUNITY_Dashboard Shell & Navigation|Dashboard Shell & Navigation]]
- [[_COMMUNITY_Theming Components|Theming Components]]
- [[_COMMUNITY_Cost Filter Modal|Cost Filter Modal]]
- [[_COMMUNITY_Dashboard Widget Stack|Dashboard Widget Stack]]
- [[_COMMUNITY_Income Filter Modal|Income Filter Modal]]
- [[_COMMUNITY_Onboarding & Invites|Onboarding & Invites]]
- [[_COMMUNITY_Core API Client|Core API Client]]
- [[_COMMUNITY_Login Screen|Login Screen]]
- [[_COMMUNITY_API Query Utilities|API Query Utilities]]
- [[_COMMUNITY_Dashboard House View|Dashboard House View]]
- [[_COMMUNITY_AI Summary Modal|AI Summary Modal]]
- [[_COMMUNITY_Dashboard Bar Chart|Dashboard Bar Chart]]
- [[_COMMUNITY_Auth Bridge|Auth Bridge]]
- [[_COMMUNITY_Theme Context|Theme Context]]
- [[_COMMUNITY_Delete Cost Modal|Delete Cost Modal]]
- [[_COMMUNITY_Delete Income Modal|Delete Income Modal]]
- [[_COMMUNITY_Admin Invites Panel|Admin Invites Panel]]
- [[_COMMUNITY_Category Section Card|Category Section Card]]
- [[_COMMUNITY_Dashboard Balances Card|Dashboard Balances Card]]
- [[_COMMUNITY_Trend Comparison Card|Trend Comparison Card]]
- [[_COMMUNITY_Delete Billing Modal|Delete Billing Modal]]
- [[_COMMUNITY_Create House Modal|Create House Modal]]
- [[_COMMUNITY_App Entry Point|App Entry Point]]
- [[_COMMUNITY_App Layout & Toast|App Layout & Toast]]
- [[_COMMUNITY_HTML Shell|HTML Shell]]
- [[_COMMUNITY_Dashboard Screen|Dashboard Screen]]
- [[_COMMUNITY_Auth Layout|Auth Layout]]
- [[_COMMUNITY_Admin Users Page|Admin Users Page]]
- [[_COMMUNITY_External Link Component|External Link Component]]
- [[_COMMUNITY_Edit Screen Info|Edit Screen Info]]
- [[_COMMUNITY_Mono Text Component|Mono Text Component]]
- [[_COMMUNITY_Client-Only Value Hook|Client-Only Value Hook]]
- [[_COMMUNITY_Client-Only Value (Web)|Client-Only Value (Web)]]
- [[_COMMUNITY_React Query App Focus|React Query App Focus]]
- [[_COMMUNITY_App Providers|App Providers]]
- [[_COMMUNITY_Neumorphic Styles|Neumorphic Styles]]
- [[_COMMUNITY_Pull to Refresh|Pull to Refresh]]
- [[_COMMUNITY_Query Client Setup|Query Client Setup]]
- [[_COMMUNITY_Shared Types|Shared Types]]
- [[_COMMUNITY_API Query String|API Query String]]
- [[_COMMUNITY_Admin Search Panel|Admin Search Panel]]
- [[_COMMUNITY_Admin Users Screen|Admin Users Screen]]
- [[_COMMUNITY_Admin User Row|Admin User Row]]
- [[_COMMUNITY_Admin Users Hook|Admin Users Hook]]
- [[_COMMUNITY_API Unwrap Util|API Unwrap Util]]
- [[_COMMUNITY_Period Summary Cards|Period Summary Cards]]
- [[_COMMUNITY_Smart Alerts Card|Smart Alerts Card]]
- [[_COMMUNITY_AI Summary Button|AI Summary Button]]

## God Nodes (most connected - your core abstractions)
1. `ReactNativeDelegate` - 6 edges
2. `useScreenActive()` - 6 edges
3. `closeOpenSwipe()` - 5 edges
4. `closeOpenSwipe()` - 5 edges
5. `closeOpenSwipe()` - 5 edges
6. `useThemeColor()` - 5 edges
7. `cooldownKey()` - 5 edges
8. `setVerifyCooldown()` - 5 edges
9. `DashboardProvider()` - 5 edges
10. `onSubmit()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `OzSave App Icon (1024x1024)` --is_ios_variant_of--> `OzSave Expo App Icon`  [INFERRED]
  ios/OzSave/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png → assets/images/icon.png
- `clearVerifyCooldown()` --calls--> `removeItem()`  [INFERRED]
  /Applications/projects/ozsave-mobile/src/lib/storage.ts → /Applications/projects/ozsave-mobile/src/modules/cost/AddCostModal.tsx
- `onSubmit()` --calls--> `setVerifyCooldown()`  [INFERRED]
  /Applications/projects/ozsave-mobile/app/(auth)/signup.tsx → /Applications/projects/ozsave-mobile/src/lib/storage.ts
- `handleResend()` --calls--> `setVerifyCooldown()`  [INFERRED]
  /Applications/projects/ozsave-mobile/app/(auth)/verify.tsx → /Applications/projects/ozsave-mobile/src/lib/storage.ts
- `useThemeColor()` --calls--> `useColorScheme()`  [INFERRED]
  /Applications/projects/ozsave-mobile/components/Themed.tsx → /Applications/projects/ozsave-mobile/components/useColorScheme.web.ts

## Communities

### Community 0 - "API & Screen Hooks"
Cohesion: 0.11
Nodes (16): useAddBilling(), useBilling(), useDeleteBilling(), useInfiniteBillings(), useUpdateBilling(), useAddCost(), useDeleteCost(), useInfiniteCosts() (+8 more)

### Community 1 - "Auth Signup & Verification"
Cohesion: 0.19
Nodes (13): meetsPasswordRules(), onSubmit(), clearToken(), clearVerifyCooldown(), cooldownKey(), getToken(), getVerifyCooldown(), setToken() (+5 more)

### Community 2 - "Billing List View"
Cohesion: 0.24
Nodes (15): capitalize(), closeAllSwipes(), closeDelete(), closeEdit(), closeOpenSwipe(), closeSelf(), formatDate(), money() (+7 more)

### Community 3 - "Cost List View"
Cohesion: 0.24
Nodes (15): closeAllSwipes(), closeDelete(), closeEdit(), closeOpenSwipe(), closeSelf(), formatDate(), isSameFilters(), money() (+7 more)

### Community 4 - "Shared Form Utilities"
Cohesion: 0.26
Nodes (14): addItem(), buildPayload(), dateFromYmd(), handleSave(), initials(), makeEmptyItem(), onChange(), removeItem() (+6 more)

### Community 5 - "Income List View"
Cohesion: 0.28
Nodes (13): closeAllSwipes(), closeOpenSwipe(), closeSelf(), formatDate(), isSameFilters(), money(), onEndReached(), onRefresh() (+5 more)

### Community 6 - "Shared Entry Form Logic"
Cohesion: 0.3
Nodes (12): buildPayload(), dateFromYmd(), handleSave(), initials(), makeInitial(), onChange(), selectAllShared(), selectJustMeShared() (+4 more)

### Community 7 - "Auth Context & Gate"
Cohesion: 0.27
Nodes (9): AuthProvider(), getMessage(), getStatus(), getToken(), isAuthInvalid(), removeToken(), setToken(), useAuth() (+1 more)

### Community 8 - "Edit Billing Modal"
Cohesion: 0.31
Nodes (11): buildPayload(), dateFromYmd(), handleSave(), initials(), onChange(), selectAllShared(), selectJustMeShared(), toggleShared() (+3 more)

### Community 9 - "Edit Income Modal Logic"
Cohesion: 0.35
Nodes (10): buildPayload(), dateFromYmd(), handleSave(), makeInitial(), onChange(), SourceSelect(), StatusSelect(), update() (+2 more)

### Community 10 - "Dashboard State Provider"
Cohesion: 0.32
Nodes (8): DashboardProvider(), rangeDays(), shiftDate(), todayKey(), toYmd(), invalidateDashboard(), useDashboardBalances(), usePeriodDashboard()

### Community 11 - "Data Formatters"
Cohesion: 0.33
Nodes (10): formatAxisMoney(), formatDayLabel(), localDayKey(), money0(), money2(), normalizeApi(), rangeMetaOf(), severityTone() (+2 more)

### Community 12 - "Edit Cost Modal"
Cohesion: 0.36
Nodes (9): buildPayload(), dateFromYmd(), handleSave(), initials(), onChange(), toggleShared(), updateField(), ymdFromDate() (+1 more)

### Community 13 - "Brand Assets & Icons"
Cohesion: 0.29
Nodes (11): OzSave Adaptive Icon (Android), OzSave App Icon (1024x1024), OzSave Favicon (Expo Web), OzSave Expo App Icon, OzSave Brand Identity, OzSave Splash Screen Placeholder (Concentric Circles Grid), OzSave Wallet Logo (Green Wallet with Gold Clasp), OzSave Splash Screen Logo (+3 more)

### Community 14 - "Edit Income Modal"
Cohesion: 0.42
Nodes (8): buildPayload(), dateFromYmd(), handleSave(), onChange(), parseTags(), updateField(), ymdFromDate(), ymdToday()

### Community 15 - "iOS Native Layer"
Cohesion: 0.31
Nodes (4): AppDelegate, ReactNativeDelegate, ExpoAppDelegate, ExpoReactNativeFactoryDelegate

### Community 16 - "Dashboard Shell & Navigation"
Cohesion: 0.42
Nodes (7): closeSheet(), GlassSurface(), go(), handleLogout(), isActive(), openSheet(), redirect()

### Community 17 - "Theming Components"
Cohesion: 0.39
Nodes (4): Text(), useThemeColor(), View(), useColorScheme()

### Community 18 - "Cost Filter Modal"
Cohesion: 0.43
Nodes (6): closePicker(), isInvalidRange(), isSameFilters(), openPicker(), parseYMD(), toYMD()

### Community 19 - "Dashboard Widget Stack"
Cohesion: 0.5
Nodes (6): circularDelta(), clamp(), commitMoveUI(), onLayout(), startExpandUI(), wrap()

### Community 20 - "Income Filter Modal"
Cohesion: 0.48
Nodes (5): closePicker(), isInvalidRange(), openPicker(), parseYMD(), toYMD()

### Community 21 - "Onboarding & Invites"
Cohesion: 0.48
Nodes (5): badgeStyle(), badgeTextStyle(), onInvitesLayout(), onPullRefresh(), scrollToInvites()

### Community 22 - "Core API Client"
Cohesion: 0.6
Nodes (4): apiRequest(), clearToken(), getToken(), setToken()

### Community 23 - "Login Screen"
Cohesion: 0.9
Nodes (3): extractMsg(), isVerifyPending(), onSubmit()

### Community 24 - "API Query Utilities"
Cohesion: 0.4
Nodes (1): appendQS()

### Community 25 - "Dashboard House View"
Cohesion: 0.6
Nodes (3): onLayout(), rangeMetaOf(), shortLabel()

### Community 26 - "AI Summary Modal"
Cohesion: 0.6
Nodes (3): AiWaveSkeleton(), loadSummary(), RevealBlock()

### Community 27 - "Dashboard Bar Chart"
Cohesion: 0.6
Nodes (3): clamp(), formatAxisMoney(), formatDayShort()

### Community 28 - "Auth Bridge"
Cohesion: 0.67
Nodes (2): registerLogout(), triggerLogout()

### Community 29 - "Theme Context"
Cohesion: 0.67
Nodes (2): resolveTheme(), ThemeProvider()

### Community 30 - "Delete Cost Modal"
Cohesion: 0.67
Nodes (2): closeIfAllowed(), handleDelete()

### Community 31 - "Delete Income Modal"
Cohesion: 0.67
Nodes (2): closeIfAllowed(), handleDelete()

### Community 32 - "Admin Invites Panel"
Cohesion: 0.67
Nodes (2): AdminInvitesPanel(), loadingInvites()

### Community 33 - "Category Section Card"
Cohesion: 0.67
Nodes (2): money(), titleizeCategory()

### Community 34 - "Dashboard Balances Card"
Cohesion: 0.67
Nodes (2): initials(), money()

### Community 35 - "Trend Comparison Card"
Cohesion: 0.83
Nodes (2): money(), TrendRow()

### Community 36 - "Delete Billing Modal"
Cohesion: 0.67
Nodes (2): closeIfAllowed(), handleDelete()

### Community 37 - "Create House Modal"
Cohesion: 0.67
Nodes (2): handleClose(), handleCreate()

### Community 38 - "App Entry Point"
Cohesion: 0.67
Nodes (1): Index()

### Community 39 - "App Layout & Toast"
Cohesion: 0.67
Nodes (1): createToastConfig()

### Community 40 - "HTML Shell"
Cohesion: 0.67
Nodes (1): Root()

### Community 41 - "Dashboard Screen"
Cohesion: 0.67
Nodes (1): DashboardScreen()

### Community 42 - "Auth Layout"
Cohesion: 0.67
Nodes (1): AuthLayout()

### Community 43 - "Admin Users Page"
Cohesion: 0.67
Nodes (1): AdminUsersPage()

### Community 44 - "External Link Component"
Cohesion: 0.67
Nodes (1): ExternalLink()

### Community 45 - "Edit Screen Info"
Cohesion: 0.67
Nodes (1): EditScreenInfo()

### Community 46 - "Mono Text Component"
Cohesion: 0.67
Nodes (1): MonoText()

### Community 47 - "Client-Only Value Hook"
Cohesion: 0.67
Nodes (1): useClientOnlyValue()

### Community 48 - "Client-Only Value (Web)"
Cohesion: 0.67
Nodes (1): useClientOnlyValue()

### Community 49 - "React Query App Focus"
Cohesion: 0.67
Nodes (1): setupReactQueryAppState()

### Community 50 - "App Providers"
Cohesion: 0.67
Nodes (1): AppProviders()

### Community 51 - "Neumorphic Styles"
Cohesion: 0.67
Nodes (1): makeNeumo()

### Community 52 - "Pull to Refresh"
Cohesion: 0.67
Nodes (1): PullToRefresh()

### Community 53 - "Query Client Setup"
Cohesion: 0.67
Nodes (1): initQueryPersistence()

### Community 54 - "Shared Types"
Cohesion: 0.67
Nodes (1): userId()

### Community 55 - "API Query String"
Cohesion: 0.67
Nodes (1): toQueryString()

### Community 56 - "Admin Search Panel"
Cohesion: 0.67
Nodes (1): AdminSearchPanel()

### Community 57 - "Admin Users Screen"
Cohesion: 0.67
Nodes (1): onRefresh()

### Community 58 - "Admin User Row"
Cohesion: 0.67
Nodes (1): initials()

### Community 59 - "Admin Users Hook"
Cohesion: 0.67
Nodes (1): useAdminUsers()

### Community 60 - "API Unwrap Util"
Cohesion: 0.67
Nodes (1): unwrap()

### Community 61 - "Period Summary Cards"
Cohesion: 0.67
Nodes (1): money()

### Community 62 - "Smart Alerts Card"
Cohesion: 0.67
Nodes (1): severityDotColor()

### Community 63 - "AI Summary Button"
Cohesion: 0.67
Nodes (1): DashboardAiSummaryButton()

## Ambiguous Edges - Review These
- `OzSave Wallet Logo (Green Wallet with Gold Clasp)` → `OzSave Splash Screen Placeholder (Concentric Circles Grid)`  [AMBIGUOUS]
  None · relation: brand_asset_paired_with

## Knowledge Gaps
- **1 isolated node(s):** `OzSave Favicon (Expo Web)`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `API Query Utilities`** (5 nodes): `appendQS()`, `api.ts`, `api.ts`, `api.ts`, `api.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Bridge`** (4 nodes): `authBridge.ts`, `registerLogout()`, `triggerLogout()`, `authBridge.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Theme Context`** (4 nodes): `ThemeContext.tsx`, `ThemeContext.tsx`, `resolveTheme()`, `ThemeProvider()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Delete Cost Modal`** (4 nodes): `DeleteCostModal.tsx`, `closeIfAllowed()`, `handleDelete()`, `DeleteCostModal.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Delete Income Modal`** (4 nodes): `DeleteIncomeModal.tsx`, `closeIfAllowed()`, `handleDelete()`, `DeleteIncomeModal.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Invites Panel`** (4 nodes): `AdminInvitesPanel()`, `loadingInvites()`, `AdminInvitesPanel.tsx`, `AdminInvitesPanel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Category Section Card`** (4 nodes): `CategorySectionCard.tsx`, `money()`, `titleizeCategory()`, `CategorySectionCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard Balances Card`** (4 nodes): `DashboardBalancesCard.tsx`, `initials()`, `money()`, `DashboardBalancesCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Trend Comparison Card`** (4 nodes): `TrendVsPreviousCard.tsx`, `TrendVsPreviousCard.tsx`, `money()`, `TrendRow()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Delete Billing Modal`** (4 nodes): `DeleteBillingModal.tsx`, `closeIfAllowed()`, `handleDelete()`, `DeleteBillingModal.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Create House Modal`** (4 nodes): `CreateHouseModal.tsx`, `handleClose()`, `handleCreate()`, `CreateHouseModal.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Entry Point`** (3 nodes): `index.tsx`, `index.tsx`, `Index()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Layout & Toast`** (3 nodes): `_layout.tsx`, `_layout.tsx`, `createToastConfig()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `HTML Shell`** (3 nodes): `+html.tsx`, `+html.tsx`, `Root()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard Screen`** (3 nodes): `dashboard.tsx`, `dashboard.tsx`, `DashboardScreen()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Layout`** (3 nodes): `_layout.tsx`, `_layout.tsx`, `AuthLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Users Page`** (3 nodes): `users.tsx`, `users.tsx`, `AdminUsersPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `External Link Component`** (3 nodes): `ExternalLink.tsx`, `ExternalLink.tsx`, `ExternalLink()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Edit Screen Info`** (3 nodes): `EditScreenInfo.tsx`, `EditScreenInfo.tsx`, `EditScreenInfo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mono Text Component`** (3 nodes): `StyledText.tsx`, `StyledText.tsx`, `MonoText()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Client-Only Value Hook`** (3 nodes): `useClientOnlyValue.ts`, `useClientOnlyValue.ts`, `useClientOnlyValue()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Client-Only Value (Web)`** (3 nodes): `useClientOnlyValue.web.ts`, `useClientOnlyValue.web.ts`, `useClientOnlyValue()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React Query App Focus`** (3 nodes): `reactQueryFocus.ts`, `setupReactQueryAppState()`, `reactQueryFocus.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Providers`** (3 nodes): `AppProviders.tsx`, `AppProviders()`, `AppProviders.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Neumorphic Styles`** (3 nodes): `Neumo.ts`, `makeNeumo()`, `Neumo.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Pull to Refresh`** (3 nodes): `PullToRefresh.tsx`, `PullToRefresh()`, `PullToRefresh.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Query Client Setup`** (3 nodes): `queryClient.ts`, `initQueryPersistence()`, `queryClient.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Shared Types`** (3 nodes): `types.ts`, `types.ts`, `userId()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Query String`** (3 nodes): `toQueryString()`, `api.ts`, `api.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Search Panel`** (3 nodes): `AdminSearchPanel()`, `AdminSearchPanel.tsx`, `AdminSearchPanel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Users Screen`** (3 nodes): `onRefresh()`, `AdminUsersScreen.tsx`, `AdminUsersScreen.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin User Row`** (3 nodes): `initials()`, `AdminUserRow.tsx`, `AdminUserRow.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Users Hook`** (3 nodes): `useAdminUsers.ts`, `useAdminUsers.ts`, `useAdminUsers()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Unwrap Util`** (3 nodes): `unwrap()`, `api.ts`, `api.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Period Summary Cards`** (3 nodes): `PeriodSummaryCards.tsx`, `money()`, `PeriodSummaryCards.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Smart Alerts Card`** (3 nodes): `SmartAlertsCard.tsx`, `severityDotColor()`, `SmartAlertsCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `AI Summary Button`** (3 nodes): `DashboardAiSummaryButton.tsx`, `DashboardAiSummaryButton()`, `DashboardAiSummaryButton.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `OzSave Wallet Logo (Green Wallet with Gold Clasp)` and `OzSave Splash Screen Placeholder (Concentric Circles Grid)`?**
  _Edge tagged AMBIGUOUS (relation: brand_asset_paired_with) - confidence is low._
- **Why does `clearVerifyCooldown()` connect `Auth Signup & Verification` to `Shared Form Utilities`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `removeItem()` connect `Shared Form Utilities` to `Auth Signup & Verification`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `useScreenActive()` (e.g. with `useInfiniteCosts()` and `useInfiniteIncomes()`) actually correct?**
  _`useScreenActive()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `OzSave Favicon (Expo Web)` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API & Screen Hooks` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._