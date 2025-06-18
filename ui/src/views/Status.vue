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
  },  data() {
    return {
      q: {
        page: "status",
      },
      urlCheckInterval: null,
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
    ...mapState(["instanceName", "instanceLabel", "core", "appName"]),
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
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.watchQueryData(vm);
      vm.urlCheckInterval = vm.initUrlBindingForApp(vm, vm.q.page);
    });
  },
  beforeRouteLeave(to, from, next) {
    clearInterval(this.urlCheckInterval);
    next();
  },
  created() {
    this.getStatus();
  },  methods: {    async getStatus() {
      this.loading.getStatus = true;
      this.error.getStatus = "";
      const taskAction = "get-status";
      const eventId = this.getUuid();

      // register to task error
      this.core.$root.$once(
        `${taskAction}-aborted-${eventId}`,
        this.getStatusAborted
      );

      // register to task completion
      this.core.$root.$once(
        `${taskAction}-completed-${eventId}`,
        this.getStatusCompleted
      );

      const res = await to(
        this.createModuleTaskForApp(this.instanceName, {
          action: taskAction,
          extra: {
            title: this.$t("action." + taskAction),
            isNotificationHidden: true,
            eventId,
          },
        })
      );
      const err = res[0];

      if (err) {
        console.error(`error creating task ${taskAction}`, err);
        this.error.getStatus = this.getErrorMessage(err);
        this.loading.getStatus = false;
        return;
      }
    },
    getStatusAborted(taskResult, taskContext) {
      console.error(`${taskContext.action} aborted`, taskResult);
      this.error.getStatus = this.$t("error.generic_error");
      this.loading.getStatus = false;
    },
    getStatusCompleted(taskContext, taskResult) {
      this.loading.getStatus = false;
      
      if (taskResult && taskResult.output) {
        this.qdrantServiceStatus = taskResult.output.qdrant_service_status || "unknown";
      } else {
        console.warn("Unexpected response structure:", taskResult);
        this.qdrantServiceStatus = "Invalid response";
      }
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
