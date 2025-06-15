<!--
  Copyright (C) 2024 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->
<template>
  <cv-side-nav
    id="app-mobile-side-nav"
    fixed
    :expanded="isExpanded"
    class="app-mobile-side-nav"
  >
    <AppSideMenuContent />
  </cv-side-nav>
</template>

<script>
import AppSideMenuContent from "@/components/AppSideMenuContent";
import { mapState } from "vuex";

export default {
  name: "AppMobileSideMenu",
  components: { AppSideMenuContent },
  computed: {
    ...mapState(["core"]),
    isExpanded() {
      return this.core && this.core.isAppDrawerExpanded;
    },
  },
};
</script>
