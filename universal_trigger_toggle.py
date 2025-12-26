import json
import re
import logging

logger = logging.getLogger(__name__)

# --- UTILS (Self-contained for standalone node) ---
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
# --------------------------------------------------

class UniversalTriggerToggle:
    NAME = "Universal Trigger Toggle"
    CATEGORY = "Lora Manager/utils"
    DESCRIPTION = "Toggle trigger words from any source"
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "group_mode": ("BOOLEAN", {"default": False}),
                "default_active": ("BOOLEAN", {"default": True}),
            },
            "optional": FlexibleOptionalInputType(any_type),
            "hidden": {"id": "UNIQUE_ID"},
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("filtered_trigger_words",)
    FUNCTION = "process_trigger_words"

    def _get_toggle_data(self, kwargs, key='toggle_trigger_words'):
        data = kwargs.get(key)
        if isinstance(data, dict) and '__value__' in data:
            return data['__value__']
        return data

    def process_trigger_words(self, group_mode, default_active, id, **kwargs):
        # The 'trigger_words' value will be in kwargs now because it's optional/dynamic
        trigger_words = kwargs.get("trigger_words", "")
        
        trigger_data = self._get_toggle_data(kwargs, 'toggle_trigger_words')
        if trigger_data:
            try:
                if isinstance(trigger_data, str):
                    trigger_data = json.loads(trigger_data)
                
                active_words = []
                for item in trigger_data:
                    if item.get('active', False):
                        active_words.append(item['text'])
                
                return (", ".join(active_words),)
            except Exception as e:
                logger.error(f"Error processing tags in Python: {e}")

        # Fallback: if it's JSON from a gallery, hide it.
        clean_input = trigger_words.strip()
        if clean_input.startswith('[') or clean_input.startswith('{'):
            return ("",)
            
        return (clean_input,)
