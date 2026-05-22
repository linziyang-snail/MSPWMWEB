<template>
  <div>
    <PageTitle
      title="角色管理"
      description="Swagger 目前僅提供角色查詢，先以列表顯示。"
      eyebrow="Roles"
    />
    <BaseTable :columns="columns" :rows="roles" />
  </div>
</template>

<script setup>
import PageTitle from "@/components/common/PageTitle.vue";
import BaseTable from "@/components/tables/BaseTable.vue";
import { mockRoles } from "@/mocks/roles.mock";

const roles = mockRoles;
const columns = [
  { key: "id", label: "角色 ID" },
  { key: "roleName", label: "角色名稱" },
];
</script>
