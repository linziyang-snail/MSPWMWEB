<template>
  <PageTitle
    title="編輯使用者"
    description="修改資料將送出審核申請。"
    eyebrow="Users"
  />
  <UserFormView mode="edit" :user-id="$route.params.id" />
</template>

<script setup>
import PageTitle from "@/components/common/PageTitle.vue";
import UserFormView from "./UserFormView.vue";
</script>
