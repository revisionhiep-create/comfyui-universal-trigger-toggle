/**
 * Standalone Universal Trigger Toggle
 * REVISION V6 - AGGRESSIVE MAGIC SYNC
 * Updated: 2025-12-25 22:15:00
 */
import { app } from "../../scripts/app.js";

// --- CSS INJECTION (Clean Pill UI) ---
const style = document.createElement('style');
style.textContent = `
    .universal-tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 10px;
        background: rgba(15, 15, 20, 0.9);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        width: 100%;
        min-height: 80px;
        max-height: 300px;
        overflow-y: auto;
        box-sizing: border-box;
        margin: 5px 0;
        align-items: flex-start;
        align-content: flex-start;
    }
    .universal-tag {
        padding: 0 14px;
        height: 26px;
        line-height: 26px;
        border-radius: 13px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        user-select: none;
        transition: all 0.1s ease-in-out;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.12);
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
    }
    .universal-tag.active {
        background: rgba(59, 130, 246, 0.9);
        color: white;
        border-color: #3b82f6;
        box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
    }
    .universal-tag:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-1px);
    }
`;
document.head.appendChild(style);

function addTagsWidget(node, name, opts, callback) {
    const container = document.createElement("div");
    container.className = "universal-tags-container";
    let widgetValue = opts?.defaultVal || [];

    const renderTags = (tagsData, widget) => {
        container.innerHTML = "";
        if (!tagsData || tagsData.length === 0) {
            container.innerHTML = '<div style="width:100%; text-align:center; opacity:0.5; padding:20px; font-size:11px; font-style:italic;">No trigger words detected</div>';
            return;
        }
        tagsData.forEach((tag, index) => {
            const tagEl = document.createElement("div");
            tagEl.className = `universal-tag ${tag.active ? 'active' : ''}`;
            const str = (tag.strength !== null && tag.strength !== undefined) ? ` (${Number(tag.strength).toFixed(2)})` : "";
            tagEl.textContent = tag.text + str;
            tagEl.onclick = (e) => {
                e.stopPropagation();
                widget.value[index].active = !widget.value[index].active;
                renderTags(widget.value, widget);
                if (widget.callback) widget.callback(widget.value);
            };
            container.appendChild(tagEl);
        });
    };

    const widget = node.addDOMWidget(name, "custom", container, {
        getValue: () => widgetValue,
        setValue: (v) => { widgetValue = v; renderTags(widgetValue, widget); },
        hideOnZoom: true
    });
    widget.value = widgetValue;
    widget.callback = callback;
    widget.serializeValue = () => widgetValue;
    return widget;
}

app.registerExtension({
    name: "UniversalTriggerToggle.Standalone",
    
    async nodeCreated(node) {
        if (node.comfyClass === "Universal Trigger Toggle (LoraManager)") {
            const self = this;
            node.serialize_widgets = true;

            setTimeout(() => {
                const triggerWordsWidget = node.widgets[0];
                const tagWidget = addTagsWidget(node, "toggle_trigger_words", { defaultVal: [] }, () => {
                    node.setDirtyCanvas(true);
                });
                node.tagWidget = tagWidget;

                const syncFromInput = async () => {
                    const input = node.inputs?.find(i => i.name === "trigger_words");
                    if (!input?.link) return;

                    const link = app.graph.links[input.link];
                    const originNode = app.graph.getNodeById(link.origin_id);
                    if (!originNode || !originNode.widgets) return;

                    let raw = "";
                    // BROAD SEARCH: Look through ALL widgets for anything that looks like a LoRA list or trigger words
                    for (const w of originNode.widgets) {
                        if (typeof w.value === "string" && w.value.trim()) {
                            // If it's JSON or has a lora path, this is our winner
                            if (w.value.includes(".safetensors") || w.value.startsWith("[") || w.name === "trigger_words") {
                                raw = w.value;
                                break;
                            }
                        }
                    }

                    if (!raw) return;

                    let processed = raw;
                    try {
                        // Check if it's JSON from Gallery or similar
                        if (raw.trim().startsWith('[') || raw.trim().startsWith('{')) {
                            const parsed = JSON.parse(raw);
                            const paths = [];
                            if (Array.isArray(parsed)) {
                                parsed.forEach(i => {
                                    if (i.lora) paths.push(i.lora);
                                    else if (typeof i === 'string' && i.endsWith('.safetensors')) paths.push(i);
                                });
                            } else if (parsed.lora) {
                                paths.push(parsed.lora);
                            }

                            if (paths.length > 0) {
                                const all = [];
                                for (const p of paths) {
                                    const n = p.split(/[\\\/]/).pop().replace(/\.safetensors$/i, "");
                                    const r = await fetch(`/api/lm/loras/get-trigger-words?name=${encodeURIComponent(n)}`);
                                    const d = await r.json();
                                    if (d.success && d.trigger_words) all.push(...d.trigger_words);
                                }
                                processed = all.length > 0 ? all.join(", ") : "";
                            }
                        } else if (raw.toLowerCase().endsWith(".safetensors")) {
                            // Direct filename/path
                            const n = raw.split(/[\\\/]/).pop().replace(/\.safetensors$/i, "");
                            const r = await fetch(`/api/lm/loras/get-trigger-words?name=${encodeURIComponent(n)}`);
                            const d = await r.json();
                            if (d.success && d.trigger_words) processed = d.trigger_words.join(", ");
                        }
                    } catch(e) {}

                    // Apply if changed
                    if (processed && triggerWordsWidget.value !== processed) {
                        console.log("[Universal Toggle] Syncing fresh trigger words...");
                        triggerWordsWidget.value = processed;
                        self.updateTagsFromMessage(node, processed);
                    }
                };

                const interval = setInterval(() => {
                    if (node.graph) syncFromInput();
                    else clearInterval(interval);
                }, 800);

                triggerWordsWidget.callback = (v) => self.updateTagsFromMessage(node, v);
                if (triggerWordsWidget.value) self.updateTagsFromMessage(node, triggerWordsWidget.value);
                node.onRemoved = () => clearInterval(interval);
            }, 150);
        }
    },

    updateTagsFromMessage(node, message) {
        if (!node.tagWidget) return;
        const existing = {};
        (node.tagWidget.value || []).forEach(t => existing[t.text] = t);
        const defActive = node.widgets.find(w => w.name === "default_active")?.value ?? true;
        const words = message.includes(',,') ? message.split(/,{2,}/) : message.split(',');
        node.tagWidget.value = words.map(w => w.trim()).filter(x => x).map(w => ({
            text: w,
            active: existing[w] ? existing[w].active : defActive,
            strength: existing[w] ? existing[w].strength : null
        }));
    }
});
