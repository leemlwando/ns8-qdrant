<!--
  Copyright (C) 2023 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->
<template>
  <cv-grid fullWidth>
    <cv-row>
      <cv-column class="page-title">
        <h2>{{ $t("status.title") }}</h2>
      </cv-column>
    </cv-row>
    <cv-row v-if="error.getStatus">
      <cv-column>
        <NsInlineNotification
          kind="error"
          :title="$t('action.get-status')"
          :description="error.getStatus"
          :showCloseButton="false"
        />
      </cv-column>
    </cv-row>
    <cv-row>
      <cv-column :md="4" :max="4">
        <NsInfoCard
          light
          :title="qdrantServiceStatus"
          :description="$t('status.qdrant_service_status')"
          :icon="Application32"
          :loading="loading.getStatus"
          class="min-height-card"
        />
      </cv-column>
    </cv-row>
  </cv-grid>
</template>

<script>
import to from "await-to-js";
import { mapState } from "vuex";
import {
  QueryParamService,
  UtilService,
  TaskService,
  IconService,
  PageTitleService,
} from "@nethserver/ns8-ui-lib";

export default {
  name: "Status",
  mixins: [
    TaskService,
    IconService,
    UtilService,
    QueryParamService,
    PageTitleService,
  ],
  pageTitle() {
    return this.$t("status.title") + " - " + this.appName;
  },
  data() {
    return {
      q: {
        page: "status",
      },
      qdrantServiceStatus: "",
      loading: {
        getStatus: false,
      },
      error: {
        getStatus: "",
      },
    };
  },
  computed: {
    ...mapState(["instanceName", "appName"]),
  },
  mounted() {
    this.getStatus();
  },
  methods: {
    async getStatus() {
      this.loading.getStatus = true;
      this.error.getStatus = "";
      const [err, data] = await to(
        this.api.get(
          `/cluster/v1/agents/${this.instanceName}/get-status`
        )
      );
      if (err) {
        console.error(err);
        this.error.getStatus = this.formatError(err);
        this.loading.getStatus = false;
        return;
      }

      this.qdrantServiceStatus = data.data.result.qdrant_service_status || "unknown";
      this.loading.getStatus = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.min-height-card {
  min-height: 6rem;
}
</style>
