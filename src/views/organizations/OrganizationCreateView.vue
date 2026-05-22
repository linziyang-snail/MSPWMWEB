<template>
  <PageTitle
    title="新增組織"
    description="新增組織後送審。"
    eyebrow="Organizations"
  />
  <OrganizationFormView mode="create" />
</template>

<script setup>
import PageTitle from "@/components/common/PageTitle.vue";
import OrganizationFormView from "./OrganizationFormView.vue";
</script>
