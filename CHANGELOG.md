# Changelog - Universal Trigger Toggle

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-12-25
### Fixed
- **UI Auto-scaling**: Removed `max-height` constraints on the tags container. The node now grows vertically to accommodate any number of trigger words without scrollbars.
- **Group Mode Bug**: Fixed an issue where toggling "Group Mode" off would not immediately ungroup words. Added immediate UI refresh callbacks.
- **Latency/Delay**: 
    - Reduced polling interval to `500ms` for faster detection of upstream changes.
    - Added immediate visual feedback (CSS class toggling) when clicking tag buttons to eliminate perceived lag.
- **Splitting Logic**: Improved handling of double commas (`,,`) when Group Mode is disabled, ensuring words are split correctly into individual pills.

## [1.0.0] - 2025-12-25
### Added
- Initial standalone release of the Universal Trigger Toggle node.
- **Smart Parser**: Backend and frontend logic to convert LoRA filenames/JSON from galleries into real trigger words.
- **Aggressive Sync**: Real-time widget monitoring to ensure instant tag updates when LoRAs are swapped in the UI.
- **Self-Contained Architecture**: Includes its own CSS injection and helper classes (`AnyType`, FlexibleOptionalInputType).
- **Professional UI**: Rounded pill-shaped buttons with active/inactive states and hover animations.
- **Strength Support**: Mouse-wheel adjustment for trigger word weights.
