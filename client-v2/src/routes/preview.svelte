<script>
  import PreviewWindow from "../components/PreviewWindow.svelte";
  import { previewStore } from "../lib/storeAdapter.js";
  import { promptStore } from "../lib/promptStore.js";
  import PromptForm from "../components/PromptForm.svelte";

  let uiState = { status: "idle", message: "" };

  // Subscribe to promptStore to update UI state
  $: if ($promptStore) {
    uiState.status = $promptStore.loading ? "loading" : "idle";
    uiState.message = $promptStore.error || "";
  }

  // Handle form submission through store
  async function handleSubmit(event) {
    await promptStore.submitPrompt(event.detail.prompt);
  }

  // seed sample content for local dev
  if (typeof window !== "undefined" && previewStore) {
    previewStore.set("<h2>Sample Poem</h2><p>A line of verse.</p>");
  }
</script>

<div style="height:100vh;padding:24px">
  <h1>Preview Route (client-v2)</h1>
  <div style="margin-top:12px">
    <PromptForm
      prompt={$promptStore.prompt}
      loading={$promptStore.loading}
      errorMsg={$promptStore.error}
      on:submit={handleSubmit}
    />
  </div>
  <div style="height:70%;margin-top:12px">
    <PreviewWindow {uiState} />
  </div>
</div>
