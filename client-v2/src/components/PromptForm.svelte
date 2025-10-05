<!-- 
  Per Core Architecture Principles (README.md):
  - Components must be "dumb" with clear separation of concerns
  - No internal fetch/update logic in UI components
  - All updates must flow through the store
  - Clear separation from business logic and API calls
-->
<script>
  import { createEventDispatcher } from "svelte";

  // State passed down to component, not managed internally
  export let prompt = "";
  export let loading = false;
  export let errorMsg = "";

  const dispatch = createEventDispatcher();

  // Component only emits events, doesn't handle business logic
  function handleSubmit() {
    dispatch("submit", { prompt });
  }

  function onKeydown(e) {
    // Simple keyboard shortcut handling only
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit();
    }
  }
</script>

<div class="prompt-form">
  <label for="prompt-input">Prompt</label>
  <div style="display:flex;gap:8px;align-items:center">
    <textarea
      id="prompt-input"
      bind:value={prompt}
      placeholder="Enter a poem prompt"
      rows="3"
      on:keydown={onKeydown}
    ></textarea>
    <button on:click={handleSubmit} disabled={loading}>Generate</button>
  </div>
  {#if loading}
    <div class="loading">Generating…</div>
  {/if}
  {#if errorMsg}
    <div class="error">{errorMsg}</div>
  {/if}
</div>

<style>
  .prompt-form {
    margin-bottom: 12px;
  }
  textarea {
    padding: 12px;
    min-width: 320px;
    min-height: 100px;
    resize: vertical;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: cyan;
    font-size: 14px;
    line-height: 1.4;
  }
  button {
    padding: 8px 12px;
  }
  .loading {
    color: #666;
    font-size: 13px;
    margin-top: 8px;
  }
  .error {
    color: #d00;
    font-size: 13px;
    margin-top: 8px;
  }
</style>
