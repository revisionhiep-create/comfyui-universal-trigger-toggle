from .universal_trigger_toggle import UniversalTriggerToggle

NODE_CLASS_MAPPINGS = {
    UniversalTriggerToggle.NAME: UniversalTriggerToggle
}

NODE_DISPLAY_NAME_MAPPINGS = {
    UniversalTriggerToggle.NAME: UniversalTriggerToggle.NAME
}

WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

