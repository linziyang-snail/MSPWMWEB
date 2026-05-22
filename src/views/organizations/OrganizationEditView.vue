<template>
  <PageTitle
    title="編輯組織"
    description="修改組織名稱後送審。"
    eyebrow="Organizations"
  />
  <OrganizationFormView mode="edit" :org-id="$route.params.id" />
</template>

<script setup>
import PageTitle from "@/components/common/PageTitle.vue";
import OrganizationFormView from "./OrganizationFormView.vue";
</script>
