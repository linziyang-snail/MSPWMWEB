<template>
  <PageTitle
    title="新增使用者"
    description="新增後需進入審核流程。"
    eyebrow="Users"
  />
  <UserFormView mode="create" />
</template>

<script setup>
import PageTitle from "@/components/common/PageTitle.vue";
import UserFormView from "./UserFormView.vue";
</script>
