<template>
  <div
    class="overflow-hidden rounded-xl border border-border-muted bg-background-surface shadow-card"
  >
    <div class="overflow-hidden">
      <table class="w-full table-fixed text-left text-sm">
        <thead
          class="bg-background-subtle text-sm font-bold text-text-secondary"
        >
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="h-16 px-4 align-middle xl:px-6"
            >
              {{ column.label }}
            </th>
            <th
              v-if="$slots.actions"
              class="h-16 w-48 px-4 text-right align-middle xl:px-6"
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
              class="wrap-break-word px-4 py-4 align-middle xl:px-6"
            >
              <slot :name="`cell-${column.key}`" :row="row">
                {{ row[column.key] || "-" }}
              </slot>
            </td>
            <td
              v-if="$slots.actions"
              class="px-4 py-4 text-right align-middle xl:px-6"
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
