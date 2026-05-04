export type RouteHandleObject = {
  backButton?: boolean;
  backButtonText?: string;
  backButtonFunction?: () => void;
  /**
   * Fallback route ID for "smart back" navigation.
   * When specified, it is used as destination if the history
   * does not contain valid pages (e.g. only success pages).
   *
   * **When to use:**
   * - Detail pages with Create/Edit → Success → Detail flows
   * - When you want to ensure safe back navigation even without valid history
   *
   * **Usage examples:**
   * - `CLIENT_SIL_DETAIL` → `backFallbackRoute: 'CLIENT_SIL_INDEX'`
   * - `ASSESSMENT_DETAIL` → `backFallbackRoute: 'ASSESSMENT_INDEX'`
   * - `ORG_SIL_SERVICE_DETAIL` → `backFallbackRoute: 'ORG_SIL_SERVICE_INDEX'`
   *
   * ```
   */
  backFallbackRoute?: string;
  /**
   * Enables "smart back" navigation that automatically skips
   * intermediate pages (success, wizard, form) in history.
   *
   * **Default:** `true` (enabled by default)
   *
   * **When to disable (enableSmartBack: false):**
   * - Pages with custom navigation logic
   * - Flows that do not have intermediate pages to skip
   * - Compatibility with legacy behavior
   *
   * **Smart Back recognizes and skips:**
   * - Success pages (state.fromSuccess, state.category containing "success")
   * - Form pages (URL with /create, /edit, /new)
   * - Wizard pages (URL with mode=add, mode=remove, mode=edit)
   *
   * @default true
   */
  enableSmartBack?: boolean;
  hideBreadcrumbs?: boolean;
  /** this property is used in Breadcrumbs Component.
   * When it's true the breadcumb element is hidden by the breadcumbs path */
  hideBreadcrumbElement?: boolean;
  sidebar: { visible?: boolean };
  custom?: boolean;
};
