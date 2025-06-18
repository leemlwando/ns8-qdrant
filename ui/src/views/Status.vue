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
      </cv-column>    </cv-row>
    <cv-row>
      <cv-column :md="4" :max="4">
        <NsInfoCard
          light
          :title="statusDisplayText"
          :description="$t('status.qdrant_service_status')"
          :icon="statusIcon"
          :loading="loading.getStatus"
          class="min-height-card"
          :class="statusCardClass"
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
  },  computed: {
    ...mapState(["instanceName", "appName"]),
    statusDisplayText() {
      if (this.qdrantServiceStatus === "active") return "Running";
      if (this.qdrantServiceStatus === "inactive") return "Stopped";
      if (this.qdrantServiceStatus === "failed") return "Failed";
      return this.qdrantServiceStatus || "Unknown";
    },
    statusIcon() {
      if (this.qdrantServiceStatus === "active") return "CheckmarkFilled32";
      if (this.qdrantServiceStatus === "failed") return "ErrorFilled32";
      return "Application32";
    },
    statusCardClass() {
      if (this.qdrantServiceStatus === "active") return "status-active";
      if (this.qdrantServiceStatus === "failed") return "status-failed";
      return "";
    }
  },
  mounted() {
    this.getStatus();
  },
  methods: {    async getStatus() {
      this.loading.getStatus = true;
      this.error.getStatus = "";
      
      try {
        const [err, data] = await to(
          this.api.get(
            `/cluster/v1/agents/${this.instanceName}/get-status`
          )
        );
        
        if (err) {
          console.error("Status API error:", err);
          this.error.getStatus = this.formatError(err);
          this.qdrantServiceStatus = "Error fetching status";
          this.loading.getStatus = false;
          return;
        }

        console.log("Status response:", data);
        
        // Handle the response structure
        if (data && data.data && data.data.result) {
          this.qdrantServiceStatus = data.data.result.qdrant_service_status || "unknown";
        } else {
          console.warn("Unexpected response structure:", data);
          this.qdrantServiceStatus = "Invalid response";
        }
        
      } catch (error) {
        console.error("Status fetch error:", error);
        this.error.getStatus = "Failed to fetch status";
        this.qdrantServiceStatus = "Error";
      }
      
      this.loading.getStatus = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.min-height-card {
  min-height: 6rem;
}

.status-active {
  border-left: 4px solid #24a148;
}

.status-failed {
  border-left: 4px solid #da1e28;
}
</style>
