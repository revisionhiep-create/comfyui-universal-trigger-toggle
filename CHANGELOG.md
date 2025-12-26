# Changelog - Universal Trigger Toggle

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-12-25
### Added
- Initial standalone release of the Universal Trigger Toggle node.
- **Smart Parser**: Backend and frontend logic to convert LoRA filenames/JSON from galleries into real trigger words.
- **Aggressive Sync**: Real-time widget monitoring to ensure instant tag updates when LoRAs are swapped in the UI.
- **Self-Contained Architecture**: Includes its own CSS injection and helper classes (`AnyType`, `FlexibleOptionalInputType`).
- **Professional UI**: Rounded pill-shaped buttons with active/inactive states and hover animations.
- **Strength Support**: Mouse-wheel adjustment for trigger word weights.

### Fixed
- Fixed UI layout issues where buttons would stretch vertically or disappear.
- Corrected Python argument ordering to ensure stable string output to downstream nodes.
- Resolved "Internal Memory" blocks that were preventing tags from updating when LoRA selections changed.
- Improved JSON handling to prevent raw code from leaking into the prompt output.

