/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

type ImportMetaEnv = Readonly<{
  VITE_DEPLOY_PATH: string;
}>;

type ImportMeta = Readonly<{
  env: ImportMetaEnv;
}>;
