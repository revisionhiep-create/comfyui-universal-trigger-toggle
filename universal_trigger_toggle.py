# FINAL REVISION - VERIFIED SYNC & UI
# Updated: 2025-12-25 22:05:00 - SYNC_FIX_V4
import json
import re
import logging

logger = logging.getLogger(__name__)

# --- UTILS (Self-contained) ---
class AnyType(str):
    def __ne__(self, __value: object) -> bool:
        return False

class FlexibleOptionalInputType(dict):
    def __init__(self, type):
        self.type = type
    def __getitem__(self, key):
        return (self.type, )
    def __contains__(self, key):
        return True

any_type = AnyType("*")

class UniversalTriggerToggle:
    NAME = "Universal Trigger Toggle (LoraManager)"
    CATEGORY = "Lora Manager/utils"
    DESCRIPTION = "Toggle trigger words from any source"
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "trigger_words": ("STRING", {"multiline": True, "default": ""}),
                "group_mode": ("BOOLEAN", {"default": True}),
                "default_active": ("BOOLEAN", {"default": True}),
                "allow_strength_adjustment": ("BOOLEAN", {"default": False}),
            },
            "optional": FlexibleOptionalInputType(any_type),
            "hidden": {"id": "UNIQUE_ID"},
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("filtered_trigger_words",)
    FUNCTION = "process_trigger_words"

    def _get_toggle_data(self, kwargs, key='toggle_trigger_words'):
        if key not in kwargs:
            return None
        data = kwargs[key]
        if isinstance(data, dict) and '__value__' in data:
            return data['__value__']
        return data

    def process_trigger_words(self, trigger_words, group_mode, default_active, allow_strength_adjustment, id, **kwargs):
        # The toggle_trigger_words widget contains the current state of all tags
        trigger_data = self._get_toggle_data(kwargs, 'toggle_trigger_words')
        
        if trigger_data:
            try:
                if isinstance(trigger_data, str):
                    trigger_data = json.loads(trigger_data)
                
                active_words = []
                for item in trigger_data:
                    if item.get('active', False):
                        word = item['text']
                        # Format output with strength if enabled
                        if allow_strength_adjustment and item.get('strength') is not None:
                            strength = float(item['strength'])
                            # Strip any existing formatting to avoid nesting like ((word:1.0):1.0)
                            clean_word = re.sub(r'\((.+):([\d.]+)\)', r'\1', word).strip()
                            active_words.append(f"({clean_word}:{strength:.2f})")
                        else:
                            active_words.append(word)
                
                output = ", ".join(active_words)
                return (output,)
            except Exception as e:
                logger.error(f"Error processing tags in Python: {e}")

        # Fallback: if it's JSON from a gallery, hide it. Otherwise return raw input.
        clean_input = trigger_words
        if clean_input.strip().startswith('[') or clean_input.strip().startswith('{'):
            return ("",)
            
        return (clean_input,)
