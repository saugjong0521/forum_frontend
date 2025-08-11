import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// eslint.config.js

// ESLint를 완전히 비활성화하려면 아래와 같이 빈 배열을 export하세요.
const eslintConfig = [];


/*
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
 */

export default eslintConfig;
