<!--
  Copyright (C) 2023 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->
<template>
  <cv-grid fullWidth>
    <cv-row>
      <cv-column class="page-title">
        <h2>{{ $t("settings.title") }}</h2>
      </cv-column>
    </cv-row>
    <cv-row v-if="error.getConfiguration">
      <cv-column>
        <NsInlineNotification
          kind="error"
          :title="$t('action.get-configuration')"
          :description="error.getConfiguration"
          :showCloseButton="false"
        />
      </cv-column>
    </cv-row>
    <cv-row>
      <cv-column>
        <cv-tile light>
          <cv-form @submit.prevent="configureModule">
            <cv-text-input
              :label="$t('settings.api_key')"
              v-model="apiKey"
              :placeholder="$t('settings.api_key')"
              :disabled="loading.getConfiguration || loading.configureModule"
              :invalid-message="error.apiKey"
              ref="apiKey"
            ></cv-text-input>
            <cv-row v-if="error.configureModule">
              <cv-column>
                <NsInlineNotification
                  kind="error"
                  :title="$t('action.configure-module')"
                  :description="error.configureModule"
                  :showCloseButton="false"
                />
              </cv-column>
            </cv-row>
            <NsButton
              kind="primary"
              :icon="Save20"
              :loading="loading.configureModule"
              :disabled="loading.getConfiguration || loading.configureModule"
              >{{ $t("settings.save") }}</NsButton
            >
          </cv-form>
        </cv-tile>
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
  name: "Settings",
  mixins: [
    TaskService,
    IconService,
    UtilService,
    QueryParamService,
    PageTitleService,
  ],
  pageTitle() {
    return this.$t("settings.title") + " - " + this.appName;
  },
  data() {
    return {
      q: {
        page: "settings",
      },
      urlCheckInterval: null,
      apiKey: "",
      loading: {
        getConfiguration: false,
        configureModule: false,
      },
      error: {
        getConfiguration: "",
        configureModule: "",
        apiKey: "",
      },
    };
  },
  computed: {
    ...mapState(["instanceName", "appName"]),
  },
  mounted() {
    this.getConfiguration();
  },
  methods: {
    async getConfiguration() {
      this.loading.getConfiguration = true;
      this.error.getConfiguration = "";
      const [err, data] = await to(
        this.api.get(
          `/cluster/v1/agents/${this.instanceName}/get-configuration`
        )
      );
      if (err) {
        console.error(err);
        this.error.getConfiguration = this.formatError(err);
        this.loading.getConfiguration = false;
        return;
      }      this.apiKey = data.data.result.ApiKey || "";
      this.loading.getConfiguration = false;
    },

    async configureModule() {
      this.loading.configureModule = true;
      this.error.configureModule = "";
      this.error.apiKey = "";

      const [err, data] = await to(
        this.api.post(
          `/cluster/v1/agents/${this.instanceName}/configure-module`,
          {
            ApiKey: this.apiKey,
          }
        )
      );

      if (err) {
        console.error(err);
        this.error.configureModule = this.formatError(err);
        this.loading.configureModule = false;
        return;
      }

      const taskUrl = data.headers["location"];
      this.waitForTask(taskUrl, this.$t("action.configure-module")).then(() => {
        this.loading.configureModule = false;
        this.getConfiguration();
      });
    },
  },
};
</script>

<style scoped lang="scss">
@import "../styles/carbon-utils";
</style>
