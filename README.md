# NAGI BENCH

NAGI STUDIO 的 LLM 测评案例集：同一段提示词，不同模型，一次生成、不许返工，并排对比它们交出的可运行作品。

One-shot LLM eval cases by NAGI STUDIO: same prompt, different models, one attempt and no retries — a side-by-side record of the runnable artifacts they ship.

**Live site:** https://bench.nagi.fun/

## 结构 / Structure

```
outputs/<model-id>/<case-id>.<ext>   模型产出原文件（HTML / SVG），文件名 = 案例 id
site/                                展示站点（Vite + React + Tailwind v4 + GSAP，bun 驱动）
site/src/data/cases.ts               案例定义：双语提示词、模型列表、运行备注
.github/workflows/deploy.yml         GitHub Pages 自动部署
```

## URL 规则 / URL scheme

| URL | 含义 / Meaning |
| --- | --- |
| `https://bench.nagi.fun/` | 站点首页 / Home |
| `https://bench.nagi.fun/#<case-id>` | 定位到某个案例 / Anchor to a case (e.g. `#mythos-craft`) |
| `https://bench.nagi.fun/#<case-id>:<model-id>` | 定位案例并选中模型 / Case + preselected model tab |
| `https://bench.nagi.fun/outputs/<model-id>/<case-id>.<ext>` | 产物直链 / Raw artifact |

切换模型标签时地址栏自动更新（`replaceState`），当前视图随时可直接分享。旧域名链接（`https://nagi-studio.github.io/nagi-bench/*`）由 GitHub Pages 自动 301 重定向到 `https://bench.nagi.fun/*`，路径保留。

Switching a model tab updates the address bar in place, so the current view is always shareable. Legacy `nagi-studio.github.io/nagi-bench/*` links are 301-redirected by GitHub Pages to `bench.nagi.fun/*` with the path preserved.

## 本地开发 / Development

```bash
cd site
bun install
bun run dev      # 同步 outputs/ 并启动 http://localhost:5173/
bun run build    # 类型检查 + 产物构建（输出到 site/dist）
```

## 添加案例或模型 / Adding a case or model

1. 把产出文件放进 `outputs/<model-id>/`，命名为 `<case-id>.<ext>`（如 `mythos-craft.html`）。
2. 在 `site/src/data/cases.ts` 里登记：
   - 新模型：加入 `MODELS`（`status: 'ran' | 'pending'`）。
   - 新案例：加入 `CASES`（中英双语 `title` / `tagline` / `prompt`）。
   - 运行记录：在 `RUNS` 里登记案例 id 对应的模型 id（可附双语 `note` 运行备注；文件名不符合约定时用 `file` 覆盖）。
3. 推送到 `main`，GitHub Actions 自动构建并部署。

Drop the artifact into `outputs/<model-id>/` named `<case-id>.<ext>`, register it in `site/src/data/cases.ts` (model in `MODELS`, case in `CASES` with bilingual prompts, run entry in `RUNS` with an optional per-model `note`), then push to `main` — GitHub Actions deploys automatically.
