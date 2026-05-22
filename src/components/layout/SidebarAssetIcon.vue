<template>
  <img :src="src" alt="" class="size-4 shrink-0 object-contain" />
</template>

<script setup>
import applicationIcon from "@/assets/building2.svg";
import buildingIcon from "@/assets/building2.svg";
import filetextIcon from "@/assets/filetext.svg";
import historyIcon from "@/assets/history.svg";
import logoutIcon from "@/assets/logout.svg";
import passwordIcon from "@/assets/password.svg";
import usersIcon from "@/assets/user copy.svg";

const props = defineProps({
  name: { type: String, required: true },
});

const iconMap = {
  application: applicationIcon,
  building: buildingIcon,
  filetext: filetextIcon,
  history: historyIcon,
  logout: logoutIcon,
  password: passwordIcon,
  users: usersIcon,
};

const src = iconMap[props.name] || filetextIcon;
</script>
