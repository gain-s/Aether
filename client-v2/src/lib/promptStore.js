// Handles prompt state and business logic per "dumb component" architecture
import { writable } from "svelte/store";
import { previewStore } from "./storeAdapter.js";

function createPromptStore() {
  const { subscribe, set, update } = writable({
    prompt: "",
    loading: false,
    error: "",
  });

  // Extract HTML from various response shapes
  function extractHtmlFromResponse(json) {
    if (!json) return null;
    if (json.data?.content) {
      const c = json.data.content;
      return c.body || c.html || JSON.stringify(c);
    }
    if (json.content) {
      const c = json.content;
      return c.body || c.html || JSON.stringify(c);
    }
    if (json.html) return json.html;
    if (json.preview) return json.preview;
    return JSON.stringify(json);
  }

  return {
    subscribe,
    set,
    // Business logic moved from component to store
    async submitPrompt(prompt) {
      if (!prompt?.trim()) {
        update((s) => ({ ...s, error: "Please enter a prompt" }));
        return;
      }

      update((s) => ({ ...s, loading: true, error: "" }));

      try {
        const res = await fetch("/prompt?dev=true", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const json = await res.json();
        const html = extractHtmlFromResponse(json);
        if (!html) throw new Error("Invalid response from server");

        // Update preview through store
        previewStore.set(html);
        update((s) => ({ ...s, prompt, loading: false }));
      } catch (e) {
        const msg = e?.message || String(e);
        update((s) => ({ ...s, error: msg, loading: false }));
      }
    },
    resetError() {
      update((s) => ({ ...s, error: "" }));
    },
  };
}

export const promptStore = createPromptStore();
