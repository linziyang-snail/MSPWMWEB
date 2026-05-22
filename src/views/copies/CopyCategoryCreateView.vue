<template>
  <PageTitle
    title="新增文案分類"
    description="建立後進入審核流程。"
    eyebrow="Copy Categories"
  />
  <CopyCategoryFormView mode="create" />
</template>

<script setup>
import PageTitle from "@/components/common/PageTitle.vue";
import CopyCategoryFormView from "./CopyCategoryFormView.vue";
</script>
