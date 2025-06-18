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
      <cv-column>        <cv-tile light>
          <cv-form @submit.prevent="configureModule">
            <cv-text-input
              :label="$t('settings.api_key')"
              v-model="apiKey"
              :placeholder="$t('settings.api_key')"
              :disabled="loading.getConfiguration || loading.configureModule"
              :invalid-message="error.apiKey"
              ref="apiKey"
            ></cv-text-input>
            
            <cv-text-input
              :label="$t('settings.custom_path')"
              v-model="customPath"
              :placeholder="'/qdrant'"
              :disabled="loading.getConfiguration || loading.configureModule"
              :invalid-message="error.customPath"
              :helper-text="$t('settings.custom_path_description')"
            ></cv-text-input>
            
            <cv-toggle
              :label="$t('settings.enable_web_ui')"
              v-model="enableWebUI"
              :disabled="loading.getConfiguration || loading.configureModule"
            >
              <template slot="text-left">Disabled</template>
              <template slot="text-right">Enabled</template>
            </cv-toggle>
            <div class="bx--form__helper-text">
              {{ $t('settings.enable_web_ui_description') }}
            </div>
            
            <cv-toggle
              :label="$t('settings.https_enabled')"
              v-model="httpsEnabled"
              :disabled="loading.getConfiguration || loading.configureModule"
            >
              <template slot="text-left">HTTP</template>
              <template slot="text-right">HTTPS</template>
            </cv-toggle>
            <div class="bx--form__helper-text">
              {{ $t('settings.https_enabled_description') }}
            </div>
            
            <cv-accordion v-if="!loading.getConfiguration && accessUrls.database">
              <cv-accordion-item>
                <template slot="title">{{ $t('settings.access_info') }}</template>
                <template slot="content">
                  <div class="access-info">
                    <div class="access-item">
                      <strong>{{ $t('settings.database_url') }}:</strong>
                      <cv-code-snippet type="single" :copy-feedback="'Copied!'" wrap-text>
                        {{ accessUrls.database }}
                      </cv-code-snippet>
                    </div>
                    <div class="access-item" v-if="enableWebUI">
                      <strong>{{ $t('settings.console_url') }}:</strong>
                      <cv-code-snippet type="single" :copy-feedback="'Copied!'" wrap-text>
                        {{ accessUrls.console }}
                      </cv-code-snippet>
                      <cv-link :href="accessUrls.console" target="_blank">
                        Open Console <Launch16 />
                      </cv-link>
                    </div>
                  </div>
                </template>
              </cv-accordion-item>
            </cv-accordion>
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
  },  data() {
    return {
      q: {
        page: "settings",
      },
      urlCheckInterval: null,
      apiKey: "",
      enableWebUI: true,
      httpsEnabled: true,
      customPath: "/qdrant",
      loading: {
        getConfiguration: false,
        configureModule: false,
      },
      error: {
        getConfiguration: "",
        configureModule: "",
        apiKey: "",
        customPath: "",
      },
    };
  },
  computed: {
    ...mapState(["instanceName", "appName"]),
    accessUrls() {
      if (!this.customPath) return {};
      
      const protocol = this.httpsEnabled ? "https" : "http";
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : "";
      const basePath = this.customPath.startsWith("/") ? this.customPath : `/${this.customPath}`;
      
      return {
        database: `${protocol}://${hostname}${port}${basePath}`,
        console: this.enableWebUI ? `${protocol}://${hostname}${port}${basePath}/dashboard` : null
      };
    }
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
      this.enableWebUI = data.data.result.EnableWebUI !== undefined ? data.data.result.EnableWebUI : true;
      this.httpsEnabled = data.data.result.HttpsEnabled !== undefined ? data.data.result.HttpsEnabled : true;
      this.customPath = data.data.result.CustomPath || "/qdrant";
      this.loading.getConfiguration = false;
    },    async configureModule() {
      this.loading.configureModule = true;
      this.error.configureModule = "";
      this.error.apiKey = "";
      this.error.customPath = "";

      // Validate custom path
      if (!this.customPath || !this.customPath.startsWith("/")) {
        this.error.customPath = "Path must start with /";
        this.loading.configureModule = false;
        return;
      }

      const [err, data] = await to(
        this.api.post(
          `/cluster/v1/agents/${this.instanceName}/configure-module`,
          {
            ApiKey: this.apiKey,
            EnableWebUI: this.enableWebUI,
            HttpsEnabled: this.httpsEnabled,
            CustomPath: this.customPath,
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

.access-info {
  margin-top: 1rem;
}

.access-item {
  margin-bottom: 1rem;
  
  strong {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  .bx--link {
    margin-top: 0.5rem;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
}

.bx--form__helper-text {
  margin-bottom: 1rem;
}
</style>
