<template>
  <div
    class="overflow-hidden rounded-xl border border-border-muted bg-background-surface shadow-card"
  >
    <div class="app-scrollbar overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead
          class="bg-background-subtle text-sm font-bold text-text-secondary"
        >
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="h-16 whitespace-nowrap px-6"
            >
              {{ column.label }}
            </th>
            <th
              v-if="$slots.actions"
              class="h-16 whitespace-nowrap px-6 text-right"
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-muted text-text-primary">
          <tr
            v-for="row in rows"
            :key="row[rowKey]"
            class="h-table-row transition hover:bg-background-hover"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="whitespace-nowrap px-6 py-4"
            >
              <slot :name="`cell-${column.key}`" :row="row">
                {{ row[column.key] || "-" }}
              </slot>
            </td>
            <td
              v-if="$slots.actions"
              class="whitespace-nowrap px-6 py-4 text-right"
            >
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <slot name="empty" />
  </div>
</template>

<script setup>
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: "id" },
});
</script>
