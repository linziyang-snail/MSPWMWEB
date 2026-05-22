<template>
  <PageTitle
    title="編輯文案分類"
    description="修改分類名稱後送審。"
    eyebrow="Copy Categories"
  />
  <CopyCategoryFormView mode="edit" :id="$route.params.id" />
</template>

<script setup>
import PageTitle from "@/components/common/PageTitle.vue";
import CopyCategoryFormView from "./CopyCategoryFormView.vue";
</script>
