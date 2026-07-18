# Codex Neuro Dream Skin

<p align="center">
  <a href="./README.md">中文</a>
</p>

An unofficial dark pixel-art Neuro / Evil Neuro theme for the Windows Codex desktop app. It injects styles through a loopback-only CDP session without modifying the official Codex package, `app.asar`, or WindowsApps files.

Based on [Fei-Away/Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin).

<p align="center">
  <img src="windows/assets/neuro-home.png" alt="Neuro and Evil Neuro home background" width="900">
</p>

## Features

- Separate artwork for Home, tasks, Pull Requests, Sites, Scheduled, and Plugins
- Neuro / Evil Neuro pixel art, CRT surfaces, and recognizable themed icons
- Native Codex controls remain interactive
- Re-applicable and reversible

## Requirements

- Windows 10 or 11
- Official Codex desktop app installed from Microsoft Store
- Node.js 22 or newer
- Windows PowerShell 5.1 or newer

## Install

Close Codex completely, then run this from the repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\windows\scripts\install-dream-skin.ps1"
```

Launch the `Codex Dream Skin` desktop shortcut. You can also run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\windows\scripts\start-dream-skin.ps1" -PromptRestart
```

If a Codex update removes the theme, close Codex and run the installer again.

## Verify

After launch, capture a verification screenshot:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\windows\scripts\verify-dream-skin.ps1" -ScreenshotPath "$PWD\dream-skin-check.png"
```

Developer checks:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\windows\tests\run-tests.ps1"
node --check ".\windows\scripts\injector.mjs"
node --check ".\windows\assets\renderer-inject.js"
```

## Restore

Normal restore:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\windows\scripts\restore-dream-skin.ps1" -PromptRestart
```

Restore the saved appearance settings and remove shortcuts:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\windows\scripts\restore-dream-skin.ps1" -RestoreBaseTheme -Uninstall -PromptRestart
```

## Security and rights

- CDP is bound to `127.0.0.1`, but other processes running as the same Windows user may still connect. Run only trusted local software while the theme is active.
- This is not an official OpenAI product and is not affiliated with, endorsed by, or sponsored by OpenAI or the Neuro-sama team.
- The MIT License covers software code only. Neuro / Evil Neuro character imagery and artwork are not included in the MIT grant; verify the relevant rights before public or commercial redistribution.

See [NOTICE.md](./NOTICE.md) for details.
