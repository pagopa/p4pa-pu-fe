/// <reference types="vite/client" />
type ImportMetaEnv = Readonly<{
  VITE_DEPLOY_PATH: string;
}>;

type ImportMeta = Readonly<{
  env: ImportMetaEnv;
}>;
