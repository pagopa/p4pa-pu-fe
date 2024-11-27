/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_DEPLOY_PATH: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }