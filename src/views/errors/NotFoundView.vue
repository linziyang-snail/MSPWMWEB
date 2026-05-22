<template>
  <div class="grid min-h-screen place-items-center bg-background-subtle px-5">
    <div
      class="max-w-md rounded-lg border border-border-muted bg-background-surface p-8 text-center"
    >
      <p class="text-sm font-semibold text-text-secondary">404</p>
      <h1 class="mt-2 text-2xl font-semibold text-text-primary">找不到頁面</h1>
      <p class="mt-3 text-sm text-text-muted">請確認網址是否正確。</p>
      <RouterLink
        to="/dashboard"
        class="mt-6 inline-block text-sm font-medium text-primary"
        >回首頁</RouterLink
      >
    </div>
  </div>
</template>
