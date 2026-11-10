---
name: awesome-design-md
description: >-
  Curated collection of 80+ world-class DESIGN.md specifications from VoltAgent
  (Linear, Stripe, Raycast, Vercel, Mercury, Supabase, etc.). Use this skill
  whenever designing, building, or restyling UI, dashboards, CRMs, or web
  applications to follow exact design tokens, typography scales, surfaces,
  borders, and component patterns of top-tier software.
---

# awesome-design-md Skill

A curated library of real-world `DESIGN.md` design system specifications extracted and analyzed from developer-focused and industry-leading software products.

## Purpose

Instead of generic boilerplate or cluttered, toy-like interfaces, `DESIGN.md` provides an unambiguous, battle-tested source of truth for:
- Semantic color tokens, surface hierarchy, and contrast ratios.
- Typography scales (display, headlines, body, tabular labels, mono numbers).
- Elevation, hairline borders (`1px` ink tints), inner highlights, and shadows.
- Component anatomy: buttons, navigation bars, master-detail split panes, kanban boards, and status chips.
- Spacing rhythm (4, 8, 12, 16, 24, 32, 48px).

## Available Design Systems in `design-md/`

The collection includes 84+ design specifications located under `./design-md/<brand>/DESIGN.md`:

- **CRM & Productivity Dashboards**: `linear.app`, `raycast`, `airtable`, `notion`, `intercom`, `cal`
- **Fintech & Enterprise Operations**: `mercury`, `stripe`, `revolut`, `wise`, `brex`
- **Developer Tools & Infrastructure**: `vercel`, `supabase`, `warp`, `resend`, `sentry`, `datadog`, `posthog`
- **AI & Modern Software**: `claude`, `cohere`, `runwayml`, `x.ai`, `elevenlabs`

## Design System Architecture for Kira Logistic CRM

When applying `awesome-design-md` to **Kira Logistic CRM**:
1. **Model Reference**: Combine the architectural density, precision, and craftsmanship of `linear.app` and `mercury` with the corporate color palette requested by Distribuidora Kiramar S.A.S.
2. **Palette Application**:
   - `--frosted-mint`: `#c4e7d4` (success, active accents, glowing tags, completed milestones).
   - `--ash-grey`: `#c4dacf` (secondary trays, subtle borders, inactive chips).
   - `--pale-slate`: `#b9c0da` (telemetry, transit states, route markers, subtle highlights).
   - `--lilac-ash`: `#998da0` (subtle badges, pending states, secondary icons).
   - `--taupe-grey`: `#63585e` (strong text, primary dark surfaces, high-authority buttons).
3. **No Visual Clutter**: Remove academic/homework-sounding banner text (`UC-01 CAMINO ALTERNATIVO 2`, `REQUISITO FUNCIONAL RF-05 CLASE RutaEntrega`). The software must look and feel like an enterprise CRM in production: crisp, intuitive, spacious, and elegant.
